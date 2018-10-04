// Modified from https://koddsson.com/posts/emoji-favicon/

'use strict';

let favicon = document.querySelector("link[rel=icon]");

if (favicon) {
    let emoji = favicon.getAttribute("data-emoji");

    if (emoji) {
        let canvas = document.createElement("canvas");
        // 32x32 pixel favicon
        canvas.height = 32;
        canvas.width = 32;

        let ctx = canvas.getContext("2d");
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // these numbers chosen by trial and error :(
        ctx.font = "30px sans-serif";
        ctx.fillText(emoji, 17, 17);

        favicon.href = canvas.toDataURL();
    }
}
