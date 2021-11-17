import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import "./App.css";
import { drawRect } from "./utilities";
const blazeface = require("@tensorflow-models/blazeface");

let temp = 0;

function App() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);


    const getEmotion = async () => {
        const emotionClassifier = await tf.loadLayersModel(
            "https://tensorflowjsemotiondetection.s3.jp-tok.cloud-object-storage.appdomain.cloud/model.json"
        );
        const faceDetector = await blazeface.load();

        setInterval(() => {
            detect(emotionClassifier, faceDetector);
        }, 16.7);
    };
    
    const detect = async (emotionClassifier, faceDetector) => {
        // Check data is available
        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video.readyState === 4
        ) {
            // Get Video Properties
            const video = webcamRef.current.video;
            let videoWidth = webcamRef.current.video.videoWidth;
            let videoHeight = webcamRef.current.video.videoHeight;

            // Set video width
            webcamRef.current.video.width = videoWidth;
            webcamRef.current.video.height = videoHeight;

            // Set canvas height and width
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;

            const returnTensors = false;
            const predictions = await faceDetector.estimateFaces(video, returnTensors);

            const ans = predictions["0"];

            let img = tf.browser.fromPixels(video);

            let resized = img;

            if (ans) {
                videoWidth = ans.bottomRight[0] - ans.topLeft[0];
                videoHeight = ans.bottomRight[1] - ans.topLeft[1];
                resized = tf.image.cropAndResize(
                    resized.expandDims(0),
                    [[...ans.topLeft, ...ans.bottomRight]],
                    [0],
                    [Math.floor(videoHeight), Math.floor(videoWidth)],
                    "bilinear"
                );
            }
            resized = tf.image.resizeBilinear(img, [48, 48]);

            const casted = resized.mean(2).toFloat();
            const expanded = casted.expandDims(0).expandDims(-1);

            const obj = await emotionClassifier.predict(expanded);

            let data = await obj.data();
            let max = 0;
            for (let ele of data) if (ele > max) max = ele;
            let value = data.findIndex((ele) => ele === max);
            const ctx = canvasRef.current.getContext("2d");
            requestAnimationFrame(() => {
                drawRect(
                    ans,
                    value,
                    ans.probability[0],
                    0.7,
                    videoWidth,
                    videoHeight,
                    ctx
                );
            });

            tf.dispose(img);
            tf.dispose(resized);
            tf.dispose(casted);
            tf.dispose(expanded);
            tf.dispose(obj);
        }
    };

    useEffect(() => {
        getEmotion();
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <Webcam
                    ref={webcamRef}
                    muted={true}
                    style={{
                        position: "absolute",
                        marginLeft: "auto",
                        marginRight: "auto",
                        left: 0,
                        right: 0,
                        textAlign: "center",
                        zindex: 9,
                        width: 480,
                        height: 480,
                    }}
                />

                <canvas
                    ref={canvasRef}
                    style={{
                        position: "absolute",
                        marginLeft: "auto",
                        marginRight: "auto",
                        left: 0,
                        right: 0,
                        textAlign: "center",
                        zindex: 8,
                        width: 480,
                        height: 480,
                    }}
                />
            </header>
        </div>
    );
}

export default App;