/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { Devs } from "@utils/constants";

const MediaEngineActions = findByPropsLazy("setLoopback", "toggleSelfDeaf"); 

let loopbackActive = false;
let btn: HTMLButtonElement | null = null;
let observer: MutationObserver | null = null;

function getSVG(active: boolean) {
    if (active) {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="#aaaab2">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 3a1 1 0 0 0-1-1h-.06a1 1 0 0 0-.74.32L5.92 7H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2.92l4.28 4.68a1 1 0 0 0 .74.32H11a1 1 0 0 0 1-1V3ZM15.1 20.75c-.58.14-1.1-.33-1.1-.92v-.03c0-.5.37-.92.85-1.05a7 7 0 0 0 0-13.5A1.11 1.11 0 0 1 14 4.2v-.03c0-.6.52-1.06 1.1-.92a9 9 0 0 1 0 17.5Z"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M15.16 16.51c-.57.28-1.16-.2-1.16-.83v-.14c0-.43.28-.8.63-1.02a3 3 0 0 0 0-5.04c-.35-.23-.63-.6-.63-1.02v-.14c0-.63.59-1.1 1.16-.83a5 5 0 0 1 0 9.02Z"/>
        </svg>`;
    } else {
        return `<svg width="20" height="20" viewBox="0 0 24 24">
            <mask id="mlmask">
                <rect fill="white" x="0" y="0" width="24" height="24"/>
                <path fill="black" d="M23.27 4.73 19.27 .73 -.27 20.27 3.73 24.27Z"/>
            </mask>
            <path fill="var(--status-danger)" mask="url(#mlmask)" fill-rule="evenodd" clip-rule="evenodd" d="M12 3a1 1 0 0 0-1-1h-.06a1 1 0 0 0-.74.32L5.92 7H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2.92l4.28 4.68a1 1 0 0 0 .74.32H11a1 1 0 0 0 1-1V3ZM15.1 20.75c-.58.14-1.1-.33-1.1-.92v-.03c0-.5.37-.92.85-1.05a7 7 0 0 0 0-13.5A1.11 1.11 0 0 1 14 4.2v-.03c0-.6.52-1.06 1.1-.92a9 9 0 0 1 0 17.5Z"/>
            <path fill="var(--status-danger)" mask="url(#mlmask)" fill-rule="evenodd" clip-rule="evenodd" d="M15.16 16.51c-.57.28-1.16-.2-1.16-.83v-.14c0-.43.28-.8.63-1.02a3 3 0 0 0 0-5.04c-.35-.23-.63-.6-.63-1.02v-.14c0-.63.59-1.1 1.16-.83a5 5 0 0 1 0 9.02Z"/>
            <path fill="var(--status-danger)" d="M22.7 2.7a1 1 0 0 0-1.4-1.4l-20 20a1 1 0 1 0 1.4 1.4Z"/>
        </svg>`;
    }
}

function createButton() {
    const b = document.createElement("button");
    b.id = "vc-mic-loopback";
    b.title = "Mic Loopback: OFF";
    b.innerHTML = getSVG(false);
    b.style.cssText = `
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px 6px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--interactive-normal);
    `;
    b.onmouseenter = () => {
        if (!loopbackActive) b.style.color = "var(--interactive-hover)";
    };
    b.onmouseleave = () => {
        if (!loopbackActive) b.style.color = "var(--interactive-normal)";
    };
    b.onclick = () => {
        loopbackActive = !loopbackActive;

        
        MediaEngineActions.setLoopback("mic_test", loopbackActive);

        b.innerHTML = getSVG(loopbackActive);
        b.title = loopbackActive ? "Mic Loopback: ON" : "Mic Loopback: OFF";
        b.style.color = loopbackActive ? "var(--interactive-active)" : "var(--interactive-normal)";
    };
    return b;
}

function mount() {
    if (document.getElementById("vc-mic-loopback")) return;
    const bar = document.querySelector("[class*='buttons_']");
    if (!bar) return;
    btn = createButton();
    bar.prepend(btn);
}

export default definePlugin({
    name: "MicrophoneTester",
    description: "Test your mic to hear microphone Quality . ",
    tags: ["Utility", "Voice"],
    authors: [Devs.pluckerpilple],

    start() {
        setTimeout(mount, 2000);
        observer = new MutationObserver(() => {
            if (!document.getElementById("vc-mic-loopback")) {
                btn = null;
                mount();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    },

    stop() {
        observer?.disconnect();
        btn?.remove();
        btn = null;
        if (loopbackActive) {
            MediaEngineActions.setLoopback("mic_test", false);
            loopbackActive = false;
        }
    },
});