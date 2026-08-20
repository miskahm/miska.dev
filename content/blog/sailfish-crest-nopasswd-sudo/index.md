---
title: "Killing Android Apps on Sailfish"
date: 2026-08-20
draft: false
description: "Give the harbour-crest helper a scoped NOPASSWD sudo rule so it can kill stuck Android apps without a password prompt."
tags: ["sailfish-os", "devel-su", "android", "sudo"]
---

Android apps on Sailfish OS run in the android container, which has its own PID namespace. A regular app can't signal those processes and force-killing them requires root. [Crest](https://openrepos.net/content/ade/crest-fork) does this by running `/usr/bin/harbour-crest` as root, but it doesn't come with sudo: you have to grant it a scoped NOPASSWD rule yourself.

## Steps

Get a root shell.

```
devel-su
```

Then, as root, install sudo:

```
pkcon install sudo
```

`visudo` syntax-checks the file before saving, so a typo can't break sudo:

```
visudo /etc/sudoers.d/01_defaultuser
```

Add the line, save, then verify:
```
%defaultuser ALL=(ALL:ALL) NOPASSWD: /usr/bin/harbour-crest
```
