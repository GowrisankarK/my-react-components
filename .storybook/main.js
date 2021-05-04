// module.exports = {
//   "stories": [
//     '../stories/*.stories.[tj]s'
//   ],
//   "addons": [
//     "@storybook/addon-links",
//     "@storybook/addon-essentials",
//     "@storybook/preset-create-react-app"
//   ]
// }
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    stories: ['../stories/*.stories.[tj]s'],
    addons: [
        '@storybook/addon-links/register',
        '@storybook/addon-knobs/register',
        '@storybook/preset-create-react-app',
        '@storybook/addon-controls',
        'storybook-readme/register',   
    ],
    webpackFinal: async (config, { configType }) => {
        config.module.rules.push({
                test: /\.scss$/i,
                use: ['style-loader', 'css-loader', 'sass-loader'],
                include: path.resolve(__dirname, '../'),
        });
        config.module.rules.push({
            test: /\.m?js$/,
            exclude: /node_modules\/(?!(@hig\/theme-data|@hig\/theme-context|flatted|pretty-bytes|proxy-polyfill)\/).*/,
            use: ['babel-loader'],
            include: path.resolve(__dirname, '../'),
        });
        if(configType === 'PRODUCTION'){
          config.optimization={
            minimize: true,
            minimizer: [
              new TerserPlugin({
                test: /\.(js)(\?.*)?$/i,
                cache: true,
                parallel: true,
                sourceMap:false,
                terserOptions: {
                  compress: false,
                  ecma: 5, 
                  mangle: true,
                  keep_classnames: true,
                  keep_fnames: true
                },
              }),
            ]
          };
        }
        return config;
    },
};