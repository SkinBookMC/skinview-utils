/// <reference path="shims.d.ts"/>

import { expect } from "chai";
import { isSlimSkin, loadSkinToCanvas } from "../src/index";

import skin1_8Default from "./textures/skin-1.8-default-no_hd.png";
import skin1_8Slim from "./textures/skin-1.8-slim-no_hd.png";
import skinOldDefault from "./textures/skin-old-default-no_hd.png";
import skinLegacyHatDefault from "./textures/skin-legacyhat-default-no_hd.png";

async function loadImage(src: string): Promise<HTMLImageElement> {
	const image = document.createElement("img");
	return new Promise((resolve, reject) => {
		image.onload = () => resolve(image);
		image.onerror = reject;
		image.src = src;
	});
}

async function loadSkin(src: string) {
	const texture = await loadImage(src);
	const canvas = document.createElement("canvas");
	loadSkinToCanvas(canvas, texture);
	return canvas;
}

describe("detect model of texture", () => {
	it("1.8 default", async () =>
		expect(isSlimSkin(await loadSkin(skin1_8Default))).to.equal(false)
	);

	it("1.8 slim", async () =>
		expect(isSlimSkin(await loadSkin(skin1_8Slim))).to.equal(true)
	);

	it("old default", async () =>
		expect(isSlimSkin(await loadSkin(skinOldDefault))).to.equal(false)
	);
});

describe("process skin texture", () => {
	it("clear the hat area of legacy skin", async () => {
		const canvas = await loadSkin(skinLegacyHatDefault);
		const data = canvas.getContext("2d")!.getImageData(0, 0, 64, 32).data;
		const checkArea = (x0, y0, w, h) => {
			for (let x = x0; x < x0 + w; x++) {
				for (let y = y0; y < y0 + h; y++) {
					expect(data[(y * 64 + x) * 4 + 3]).to.equal(0);
				}
			}
		};
		checkArea(40, 0, 8 * 2, 8); // top + bottom
		checkArea(32, 8, 8 * 4, 8) // right + front + left + back
	});
});
