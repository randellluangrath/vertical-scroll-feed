// Polyfills MUST load before anything imports aws-amplify.
// - get-random-values: crypto.getRandomValues for UUID/signature generation
// - async-iterator: Hermes lacks Symbol.asyncIterator, which Amplify uses
import "react-native-get-random-values";
import "@azure/core-asynciterator-polyfill";

import { registerRootComponent } from "expo";
import App from "./src/App";

registerRootComponent(App);
