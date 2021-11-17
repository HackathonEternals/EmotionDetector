// Define our labelmap
let emotion = [
    "angry",
    "disgusted",
    "fearful",
    "happy",
    "neutral",
    "sad",
    "surprised",
];

// Define a drawing function
export const drawRect = (
    box,
    class_val,
    score,
    threshold,
    imgWidth,
    imgHeight,
    ctx
) => {
    if (box && class_val && score > threshold) {

        const {topLeft} = box;
        const x = topLeft[0];
        const y = topLeft[1];
        const text = class_val

        ctx.strokeStyle = "green";
        ctx.lineWidth = 5;
        ctx.fillStyle = "red";
        ctx.font = "24px Roboto";

        ctx.beginPath();
        ctx.fillText(
            emotion[text] + " - " + Math.round(score * 100) / 100,
            x,
            y
        );
        ctx.rect(
            x,
            y,
            imgWidth,
            imgHeight
        );
        ctx.stroke();
    }
};
