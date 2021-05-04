
// export const parameters = {
//   actions: { argTypesRegex: "^on[A-Z].*" },
//   controls: {
//     matchers: {
//       color: /(background|color)$/i,
//       date: /Date$/,
//     },
//   },
// }
import { NativeEventSource, EventSourcePolyfill } from 'event-source-polyfill';
import ProxyPolyfillBuilder from 'proxy-polyfill/src/proxy';

if(global.EventSource === undefined){
    global.EventSource = NativeEventSource || EventSourcePolyfill;
}

if(global.Proxy === undefined){
    global.Proxy = ProxyPolyfillBuilder();
}
