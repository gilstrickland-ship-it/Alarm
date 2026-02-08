const expoConfig = require("eslint-config-expo/flat");

module.exports = [
  ...expoConfig,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-native",
              importNames: ["SafeAreaView"],
              message:
                "Use SafeAreaView from 'react-native-safe-area-context' instead. See https://github.com/AppAndFlow/react-native-safe-area-context",
            },
          ],
        },
      ],
    },
  },
];
