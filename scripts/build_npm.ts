// ex. scripts/build_npm.ts
import { build, emptyDir } from '@deno/dnt'

await emptyDir('./npm')

await build({
   entryPoints: ['./index.ts'],
   outDir: './npm',
   shims: {
      // see JS docs for overview and more options
      deno: true,
   },
   package: {
      // package.json properties
      name: '@dreamit/graphql-std-schema',
      version: Deno.args[0] ?? '0.0.1',
      description: 'Standard Schema for GraphQL response',
      license: 'MIT',
      repository: {
         type: 'git',
         url: 'git+https://github.com/dreamit-de/graphql-std-schema.git',
      },
      bugs: {
         url: 'https://github.com/dreamit-de/graphql-std-schema/issues',
      },
   },
   postBuild() {
      // steps to run after building and before running the tests
      Deno.copyFileSync('LICENSE', 'npm/LICENSE')
      Deno.copyFileSync('README.md', 'npm/README.md')
   },
})
