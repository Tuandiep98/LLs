import { defaultLocale, locales } from "./config";

export const LOCALE_STORAGE_KEY = "lls-locale";

/**
 * Browser-side language detection for static hosting, where there is no
 * server proxy. Runs as an inline script on "/": saved choice first, then
 * the browser languages, then the default.
 */
export function localeRedirectScript(basePath: string) {
  return `(function(){var L=${JSON.stringify(locales)},s=null;try{s=localStorage.getItem(${JSON.stringify(LOCALE_STORAGE_KEY)})}catch(e){}
function m(t){t=(t||"").toLowerCase();if(t.indexOf("zh")===0)return"zh-Hans";var p=t.split("-")[0];return L.indexOf(p)>=0?p:null}
var l=L.indexOf(s)>=0?s:null;if(!l){var n=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language];for(var i=0;i<n.length&&!l;i++)l=m(n[i])}
location.replace(${JSON.stringify(basePath)}+"/"+(l||${JSON.stringify(defaultLocale)})+"/"+location.search+location.hash)})()`;
}
