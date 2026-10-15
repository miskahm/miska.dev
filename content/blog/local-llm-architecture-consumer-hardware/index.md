---
title: "Local LLM Architecture: High-Performance Inference on Consumer Hardware"
date: 2026-10-14
draft: false
description: "How MoE inference engines like Strata run a 125-billion-parameter model on a single 24 GB consumer GPU, with architecture, memory tiering, and numbers measured on my own machine"
tags: ["llm", "ai", "hardware", "gpu", "amd", "performance"]
---

Open-source projects like [Strata](https://github.com/Niko1221/Strata) and [Project Maya](https://github.com/mw00/project-maya) run models in the 125–321 billion parameter range on high-end consumer GPUs. Everything below is measured on my own machine, not copied from marketing pages.

## 1. The Hardware Constraint

Standard large language models (LLMs) use dense architectures. A dense model loads **all** parameter weights into memory to process each token.

High-end consumer hardware typically includes:

- One GPU with 24 gigabytes (GB) of video RAM (for example, an AMD Radeon RX 7900 XTX or an NVIDIA RTX 3090/4090)
- System memory with 64 GB of DDR5 RAM (~60 GiB usable)
- Non-Volatile Memory Express (NVMe) solid-state drive (SSD) storage

A dense model with 125B parameters requires more than 250 GB of VRAM at half precision (16-bit). Standard consumer GPUs cannot hold that volume. A 125B dense model does not fit on this hardware, so the architecture has to change.

## 2. Technical Solution: Mixture-of-Experts (MoE) Routing

MoE models replace the dense feed-forward networks (FFN) with dynamic routing layers. An MoE model contains many specialized subnetworks, called "experts."

The model in Strata (Qwen3.8-Flash-Next, ~125B backbone) is built from 24,576 experts, and each token only needs 10 of them.

The router activates those 10 experts for each token. The engine computes only the active ones, which keeps per-token latency low while total model capacity stays large.

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

All 24,576 expert weights still have to live somewhere, even though only 10 run per token. That is a memory problem, and tiered memory solves it.

## 3. Storage and Memory Pipelining

Inference engines like Strata use a tiered memory hierarchy to stream and execute model weights:

| Memory tier | Content stored | Access speed |
|---|---|---|
| VRAM (GPU) | Hottest experts (13,440 cached on my card), attention layers, KV cache | Highest |
| System RAM | The full quantized expert set (~40 GB resident), lookup tables | Medium |
| NVMe SSD | Model files the expert pool is packed from | Low |

How the streaming works:

1. The engine puts attention layers, dense tensors (`dense.bin`) and the KV cache into GPU VRAM. On my card, serving occupies all 24 GB: the engine wants the whole card.
2. The full quantized expert set stays resident in system RAM, and GPU-cache misses are served over PCIe.
3. Only when RAM runs out does the engine map experts from the model files on the NVMe SSD. In my measurements this tier never engaged during a one-hour soak test on a machine with ~60 GiB of usable RAM. All expert traffic was GPU-cache hits or PCIe reads from RAM.
4. The engine also runs multi-token prediction (MTP) speculative decoding. The draft layer uses tensors from the same model family, packed separately (~5 GB), not a separate helper model. It drafts several tokens ahead, and the main model verifies the draft in one batch. In practice it roughly doubles output speed; on a typical reply 25–33 drafted tokens are accepted.

## 4. Performance Comparison (measured)

Hardware used for both measurements:

- GPU: AMD Radeon RX 7900 XTX (24 GB VRAM)
- CPU: AMD Ryzen 7 9800X3D
- RAM: 64 GB DDR5 (~60 GiB usable)
- Storage: Crucial T705 NVMe SSD (PCIe 5.0)

**Historical baseline (dense architecture):**

- Model: Qwen3.8-27B, dense, Q4_K_XL GGUF (17.9 GB)
- Engine: llama.cpp (Vulkan) behind llama-swap
- VRAM: 23.1 GiB steady with a 2×80K context, leaving 0.9 GiB of headroom on a 24 GB card
- Generation speed: ~57 tokens/second solo

**Updated system (MoE architecture via Strata):**

- Model: Swift 1.5, a fine-tune of Qwen3.8-Flash-Next (~125B MoE), IQ2_XS quant (68 GB on disk)
- Engine: Strata v0.1.43.1, ROCm 10.1.0, running in a podman container
- Execution method: tiered VRAM/RAM expert streaming with MTP speculative decoding
- Generation speed: 75–81 tokens/second (community benchmark suite: 75.1 tok/s median on short chat)
- Prefill: 1,500–2,000 tok/s on fresh 16K prompts

A 125B MoE model on a single 24 GB consumer card generates faster than a 27B dense model that fills the same card, while carrying roughly 4.6× the total parameters.

Two caveats on those numbers. These are thinking models: tokens spent on `reasoning_content` count toward the speed but not toward the visible answer. And run-to-run drift on this box measured 2.3% within a run and up to +8.9% between runs for an identical setting, so treat single readings with care.

## 5. What About Project Maya?

[Project Maya](https://github.com/mw00/project-maya) is the same idea taken further: it runs GLM-5.3-Flash, 321B parameters with ~18B active per token, using the same tiering (hottest experts on the GPU, the rest in RAM, the remainder on NVMe) and its own MTP draft block. Its community numbers range from ~26 tok/s on a single RTX 3090 to 118 tok/s on four RTX 4090s. AMD support is experimental (the RX 7900 XT/XTX path is text-only), which is why Strata, where AMD is a first-class target, is what runs on my machine.

## 6. Where the Speed Comes From

The GPU matters less than the rest of the box. The card holds the hottest experts and the KV cache, 64 GB of system RAM holds the full expert arena, and PCIe carries every miss between them. That is the whole mechanism, and the tokens-per-second figures in section 4 are what it buys.

## Links and References

- Strata repository: [github.com/Niko1221/Strata](https://github.com/Niko1221/Strata)
- Project Maya repository: [github.com/mw00/project-maya](https://github.com/mw00/project-maya)
