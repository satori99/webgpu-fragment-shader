/** rollup.config.js */

import pkg from './package.json' assert { type: 'json' }

import { string } from 'rollup-plugin-string'

export default {
    input: 'index.js',
    plugins: [
        string( {
            include: "**/*.wgsl",
        } )
    ],
    output: [ {
        file: `build/${pkg.name}-${pkg.version}.js`,
        format: 'es',
    }, {
        file: `build/${pkg.name}-${pkg.version}.min.js`,
        format: 'es',
    } ]
}