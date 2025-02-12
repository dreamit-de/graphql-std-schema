# graphql-std-schema

Standard Schema for GraphQL response

## Run

Only tests are executable. To run tests execute **deno test**.

## Lint

To check for linting issues execute **deno lint**.

## Build npm library

To build an npm library execute **deno run -A scripts/build_npm.ts 0.0.1**
replacing 0.0.1 with the version you wish to build. Library will be located in
"/npm" folder. Run **npm pack** in npm folder to create a tar archive of the
library and add them to the projects you want to use the PersonService in.
