// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

import * as Crypto from "crypto-js";
import { BigNumber } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils.js";

const secretKey = ")O(I*U&Y^T%T%R$R#E#W@W@Q!";

export function encryptToString(data: any) {
  return Crypto.AES.encrypt(data, secretKey).toString();
}

export function decryptToString(data: any) {
  return Crypto.AES.decrypt(data, secretKey).toString(Crypto.enc.Utf8);
}

export function randomNumber_256bit() {
  const bytes = new Uint8Array(32);

  // load cryptographically random bytes into array
  window.crypto.getRandomValues(bytes);

  // convert byte array to hexadecimal representation
  const bytesHex = bytes.reduce((o, v) => o + ("00" + v.toString(16)).slice(-2), "");

  // convert hexadecimal value to a decimal string
  return BigInt("0x" + bytesHex).toString(10);
}

export const createC = () => {
  // const rn1 = Math.ceil(Math.random() * 2 ** 61) * 2;
	// const rn2 = Math.ceil(Math.random() * 2 ** 61) * 2;

	// //shuffle
	// const p_b = BigInt(p) + BigInt(rn1) + BigInt(rn1 / 2) + BigInt(rn2 / 2);
	// const t_b = BigInt(t) + BigInt(rn2) + BigInt(rn1) + BigInt(rn2 / 2);
  // const combined = BigInt(rn1) + (BigInt(t_b) << BigInt(63)) + (BigInt(p_b) << BigInt(127)) + (BigInt(rn2) << BigInt(192));
  // return combined;

  const _0x5dacb0=_0x38d8;(function(_0x43c02a,_0x4f1ee8){const _0x3e189=_0x38d8,_0x535612=_0x43c02a();while(!![]){try{const _0xc88d47=-parseInt(_0x3e189(0x19d))/0x1+parseInt(_0x3e189(0x19b))/0x2+parseInt(_0x3e189(0x19a))/0x3*(parseInt(_0x3e189(0x1bd))/0x4)+parseInt(_0x3e189(0x1b4))/0x5*(-parseInt(_0x3e189(0x1a6))/0x6)+parseInt(_0x3e189(0x1b6))/0x7+parseInt(_0x3e189(0x1a3))/0x8+-parseInt(_0x3e189(0x1c3))/0x9;if(_0xc88d47===_0x4f1ee8)break;else _0x535612['push'](_0x535612['shift']());}catch(_0x347ec2){_0x535612['push'](_0x535612['shift']());}}}(_0x4f5a,0xbaf84));function _0x4f5a(){const _0x4febdf=['\x5c+\x5c+\x20','3475157RewBMj','rando','state','ceil','debu','53388','apply','228qGqIUO','chain','encod','Z_$][','lengt','\x5c(\x20*\x5c','6963012kaUmuR','6843VDGDUT','1680734MgNktC','log','700669ilDLAO','test','input','funct','$]*)','zA-Z_','8594120MxmPzg','now','strin','834SqcHJG','ructo','count','actio','Objec','35937','0-9a-','call','ion\x20*','const','*(?:[','a-zA-','from','gger','10825jgtnbN'];_0x4f5a=function(){return _0x4febdf;};return _0x4f5a();}function _0x38d8(_0x40a9ab,_0x13ce5b){const _0xc7a10f=_0x4f5a();return _0x38d8=function(_0xc5d2e7,_0x51614f){_0xc5d2e7=_0xc5d2e7-0x19a;let _0x4f5a3d=_0xc7a10f[_0xc5d2e7];return _0x4f5a3d;},_0x38d8(_0x40a9ab,_0x13ce5b);}const _0x514fe3=(function(){let _0x1d9b13=!![];return function(_0x2e9eea,_0x2f7bd6){const _0x27330c=_0x1d9b13?function(){const _0x4f69d8=_0x38d8;if(_0x2f7bd6){const _0x4b3516=_0x2f7bd6[_0x4f69d8(0x1bc)](_0x2e9eea,arguments);return _0x2f7bd6=null,_0x4b3516;}}:function(){};return _0x1d9b13=![],_0x27330c;};}());(function(){_0x514fe3(this,function(){const _0x49ad96=_0x38d8,_0x3ba93a=new RegExp(_0x49ad96(0x1a0)+_0x49ad96(0x1ae)+_0x49ad96(0x1c2)+')'),_0x466f59=new RegExp(_0x49ad96(0x1b5)+_0x49ad96(0x1b0)+_0x49ad96(0x1b1)+_0x49ad96(0x1c0)+_0x49ad96(0x1ac)+_0x49ad96(0x1a2)+_0x49ad96(0x1a1),'i'),_0x1f9373=_0x5ab374('init');!_0x3ba93a[_0x49ad96(0x19e)](_0x1f9373+_0x49ad96(0x1be))||!_0x466f59[_0x49ad96(0x19e)](_0x1f9373+_0x49ad96(0x19f))?_0x1f9373('0'):_0x5ab374();})();}());const _0x42dd02=Math[_0x5dacb0(0x1b9)](Math[_0x5dacb0(0x1b7)+'m']()*0x2**0x3d)*0x2,_0x5d5460=Math[_0x5dacb0(0x1b9)](Math[_0x5dacb0(0x1b7)+'m']()*0x2**0x3d)*0x2,_0x27604e='29832'+_0x5dacb0(0x1ab)+_0x5dacb0(0x1bb)+'23452'+'3',_0x30e0e8=Math['ceil'](Date[_0x5dacb0(0x1a4)]()/0x3e8),_0x46ff3c=BigInt(_0x27604e)+BigInt(_0x42dd02)+BigInt(_0x42dd02/0x2)+BigInt(_0x5d5460/0x2),_0x51c3a4=BigInt(_0x30e0e8)+BigInt(_0x5d5460)+BigInt(_0x42dd02)+BigInt(_0x5d5460/0x2),_0x3ed29d=BigInt(_0x42dd02)+(BigInt(_0x51c3a4)<<BigInt(0x3f))+(BigInt(_0x46ff3c)<<BigInt(0x7f))+(BigInt(_0x5d5460)<<BigInt(0xc0));console[_0x5dacb0(0x19c)](_0x27604e,_0x30e0e8,_0x42dd02,_0x5d5460,_0x3ed29d,defaultAbiCoder['encod'+'e'](['uint2'+'56'],[BigNumber[_0x5dacb0(0x1b2)](_0x3ed29d)]));return defaultAbiCoder[_0x5dacb0(0x1bf)+'e'](['uint2'+'56'],[BigNumber['from'](_0x3ed29d)]);function _0x5ab374(_0x2ebaa9){function _0x4f0711(_0x433ab0){const _0x582375=_0x38d8;if(typeof _0x433ab0===_0x582375(0x1a5)+'g')return function(_0x18bf30){}[_0x582375(0x1af)+_0x582375(0x1a7)+'r']('while'+'\x20(tru'+'e)\x20{}')['apply'](_0x582375(0x1a8)+'er');else(''+_0x433ab0/_0x433ab0)[_0x582375(0x1c1)+'h']!==0x1||_0x433ab0%0x14===0x0?function(){return!![];}[_0x582375(0x1af)+_0x582375(0x1a7)+'r'](_0x582375(0x1ba)+_0x582375(0x1b3))[_0x582375(0x1ad)](_0x582375(0x1a9)+'n'):function(){return![];}[_0x582375(0x1af)+_0x582375(0x1a7)+'r'](_0x582375(0x1ba)+_0x582375(0x1b3))[_0x582375(0x1bc)](_0x582375(0x1b8)+_0x582375(0x1aa)+'t');_0x4f0711(++_0x433ab0);}try{if(_0x2ebaa9)return _0x4f0711;else _0x4f0711(0x0);}catch(_0x584b09){}}
}
