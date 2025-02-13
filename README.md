# graphql-std-schema

[Standard Schema][1] for [GraphQL][2] response.

## Installation

```sh
npm install --save @dreamit/graphql-std-schema
```

TypeScript declarations are provided within the project.

## Features

- Works with both strings and objects
- Strings can be parsed to objects (see **parseStringToObject** option)
- Checks/Validates if input is a valid [GraphQL][2] response
  - At least one of _data_ or _errors_ field exists
  - _data_ needs to be an object
  - _errors_ needs to be an array
  - _errors_ should not be empty is it exists
  - _extensions_ should be an object if it exists
  - There should be no additional fields besides _data_, _errors_ and
    _extensions_ (configurable)
- _findIssues_ function is exported and can be used without generating a schema
- Typescript with zero additional production dependencies

## Content of the library

The library exports one type and two functions.

- _graphQLResponseSchema_: Creates a [GraphQL][2] response schema. Options can
  be provided to adjust validation/checks
- _findIssues_: Checks for issues in the response object with the given options.
  Internally used but can also be used standalone to check for issues without
  generating a Schema.
- _ValidationOptions_: Interface for the Validation options.

Two options are available to configure validation behavior. See interface below.

```typescript
export interface ValidationOptions {
   /**
    * In a GraphQL response only the fields "data", "errors" and "extensions" are allowed. When set to true
    * this checks allows additional fields. According to GraphQL spec October 2021 this should not be the case.
    */
   allowAdditionalFieldsInResponse?: boolean

   /**
    * If value is a string, define if it should be parsed to an object. Otherwise an issue will be created.
    */
   parseStringToObject?: boolean
}
```

## Validate an input

To validate an input the schema can be generated with _graphQLResponseSchema()_
and the input can be validated with the\
_validate_ function. For a quick check the _findIssues_ function can be used
without a schema, the function will return a _StandardSchemaV1.Issue[]_.

Example code:

```typescript
// Optionally, provide options to adjust validation
const schema = graphQLResponseSchema()
const validationResults = schema['~standard'].validate(someInput)

// Quick validation without a schema
const foundValidationIssues = findIssues(someInput)
```

## Contact

If you have problems, questions or issues please visit our
[Issue page](https://github.com/dreamit-de/graphql-std-schema/issues) and open a
new issue if there are no fitting issues for your topic yet.

## License

graphql-std-schema is under [MIT-License](./LICENSE).

[1]: https://standardschema.dev/
[2]: https://spec.graphql.org/
