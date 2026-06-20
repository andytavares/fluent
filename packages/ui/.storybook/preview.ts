import type { Preview } from "@storybook/react";
import "../src/globals.css";
import "../src/themes/dark.css";
import "../src/themes/light.css";
import "../src/themes/motion.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#0f1117" },
        { name: "light", value: "#ffffff" },
      ],
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
  },
};

export default preview;
