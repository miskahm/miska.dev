---
title: "Local LLM Architecture: High-Performance Inference on Consumer Hardware"
date: 2026-10-14
draft: false
description: "How MoE inference engines like Strata run a 125-billion-parameter model on a single 24 GB consumer GPU — architecture, memory tiering, and numbers measured on my own machine"
tags: ["llm", "ai", "hardware", "gpu", "amd", "performance"]
---

This technical post describes how modern inference engines execute large Mixture-of-Experts (MoE) models on consumer hardware. Open-source projects like [Strata](https://github.com/Niko1221/Strata) and [Project Maya](https://github.com/mw00/project-maya) run models in the 125–321 billion parameter range on high-end consumer GPUs — the numbers in this post are measured on my own machine, not taken from marketing pages.

## 1. The Hardware Constraint

Standard large language models (LLMs) use dense architectures. A dense model loads **all** parameter weights into memory to process each token.

High-end consumer hardware typically includes:

- One GPU with 24 gigabytes (GB) of video RAM (for example, an AMD Radeon RX 7900 XTX or an NVIDIA RTX 3090/4090)
- System memory with 64 GB of DDR5 RAM (~60 GiB usable)
- Non-Volatile Memory Express (NVMe) solid-state drive (SSD) storage

A dense model with 125B parameters requires more than 250 GB of VRAM at half precision (16-bit). Standard consumer GPUs cannot hold that volume. So a 125B dense model is simply out of reach — the architecture has to change.

## 2. Technical Solution: Mixture-of-Experts (MoE) Routing

MoE models replace the dense feed-forward networks (FFN) with dynamic routing layers. An MoE model contains many specialized subnetworks, called "experts."

The model in Strata (Qwen3.8-Flash-Next, ~125B backbone) is built from **24,576 experts** — and each token only needs **10** of them.

Key characteristics of MoE execution:

- **Selective activation**: the router activates a small subset of experts per token (10 out of 24,576 in this model)
- **Reduced compute per token**: the engine only computes the active experts, which keeps inference latency low while the total model capacity stays large

```text
+-------------------------------------------------------------------+
|                        Token Input                                |
+-------------------------------------------------------------------+
                                  |
                                  v
                       +--------------------+
                       | Router / Gate Layer|
                       +--------------------+
                          /     |      \
                         /      |       \  (Selects 10 active experts)
                        v       v        v
                   +------+  +------+  +------+
                   |Exp 01|  |Exp 04|  |Exp 12|  (Active in VRAM)
                   +------+  +------+  +------+
                        \       |       /
                         \      |      /
                          v     v     v
+-------------------------------------------------------------------+
|                        Combined Output                            |
+-------------------------------------------------------------------+
```

The catch: the *weights* of all 24,576 experts still have to live somewhere, even though only 10 are used per token. That is a memory problem, not a compute problem — and it is solved with tiered memory.

## 3. Storage and Memory Pipelining

Inference engines like Strata use a tiered memory hierarchy to stream and execute model weights:

| Memory tier | Content stored | Access speed |
|---|---|---|
| VRAM (GPU) | Hottest experts (13,440 cached on my card), attention layers, KV cache | Highest |
| System RAM | The full quantized expert set (~40 GB resident), lookup tables | Medium |
| NVMe SSD | Model files the expert pool is packed from | Low |

Operational procedure for expert streaming:

1. **Load core parameters**: attention layers, dense tensors (`dense.bin`) and the KV cache go into GPU VRAM. On my card, serving leaves ~24 GB of the 24 GB card occupied — the engine wants the whole card.
2. **Keep the full expert set in RAM**: the engine keeps the whole quantized expert arena resident in system RAM and serves GPU-cache misses over PCIe.
3. **Fall back to the SSD only when RAM runs out**: on machines that cannot hold the whole arena, the engine maps experts directly from the model files on the NVMe SSD. Worth noting from my own measurements: with ~60 GiB of usable RAM, this tier **never engaged** during a one-hour soak test — all expert traffic was GPU-cache hits or PCIe reads from RAM.
4. **Speculative decoding**: the engine runs a multi-token prediction (MTP) draft layer — tensors taken from the *same* model family, packed separately (~5 GB), not a separate helper model. It drafts several tokens ahead, and the main model verifies the whole draft in one batch. In practice it roughly doubles output speed; on a typical reply 25–33 drafted tokens are accepted.

## 4. Performance Comparison (measured)

Hardware used for both measurements:

- **GPU**: AMD Radeon RX 7900 XTX (24 GB VRAM)
- **CPU**: AMD Ryzen 7 9800X3D
- **RAM**: 64 GB DDR5 (~60 GiB usable)
- **Storage**: Crucial T705 NVMe SSD (PCIe 5.0)

**Historical baseline (dense architecture):**

- Model: Qwen3.8-27B, dense, Q4_K_XL GGUF (17.9 GB)
- Engine: llama.cpp (Vulkan) behind llama-swap
- VRAM: 23.1 GiB steady with a 2×80K context — 0.9 GiB of headroom on a 24 GB card
- Generation speed: **~57 tokens/second** solo

**Updated system (MoE architecture via Strata):**

- Model: Swift 1.5, a fine-tune of Qwen3.8-Flash-Next (~125B MoE), IQ2_XS quant (68 GB on disk)
- Engine: Strata v0.1.43.1, ROCm 10.1.0, running in a podman container
- Execution method: tiered VRAM/RAM expert streaming with MTP speculative decoding
- Generation speed: **75–81 tokens/second** (community benchmark suite: 75.1 tok/s median on short chat)
- Prefill: 1,500–2,000 tok/s on fresh 16K prompts

The headline: a **125B MoE model on a single 24 GB consumer card generates faster than a 27B dense model that fills the card completely**, while carrying roughly 4.6× the total parameters.

Two honesty notes. First, these are thinking models — tokens spent on `reasoning_content` count toward the speed but not toward the visible answer. Second, run-to-run drift on this box measured 2.3% within a run and up to +8.9% between runs for an identical setting, so treat single readings with care.

## 5. What About Project Maya?

[Project Maya](https://github.com/mw00/project-maya) is the same idea taken further: it runs **GLM-5.3-Flash — 321B parameters, ~18B active per token** — with the same tiering (hottest experts on the GPU, the rest in RAM, the remainder on NVMe) and its own MTP draft block. Its community numbers range from ~26 tok/s on a single RTX 3090 to 118 tok/s on four RTX 4090s. AMD support is experimental (the RX 7900 XT/XTX path is text-only), which is why Strata — where AMD is a first-class target — is what runs on my machine.

## 6. Conclusion

Engineers can now host 125B+ parameter models on consumer hardware. By combining MoE routing, quantized expert tables, tiered memory streaming and MTP speculative decoding, local inference engines deliver faster generation than older dense models a fraction of their size — measured, not promised.

## Links and References

- Strata repository: [github.com/Niko1221/Strata](https://github.com/Niko1221/Strata)
- Project Maya repository: [github.com/mw00/project-maya](https://github.com/mw00/project-maya)
