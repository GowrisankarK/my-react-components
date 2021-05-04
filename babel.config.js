module.exports = {
    presets:[
        "@babel/preset-env",
        "@babel/preset-react"
    ],
    plugins :['@babel/plugin-transform-arrow-functions',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-transform-destructuring',
    'babel-plugin-macros']
}