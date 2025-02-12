import { findIssues, graphQLResponseSchema } from './GraphQLStandardSchema.ts'
import { assertEquals, assertRejects } from 'jsr:@std/assert'
import type { StandardSchemaV1 } from './StandardSchemaV1.ts'

// Helper function from https://standardschema.dev/ to validate an input
export async function standardValidate<T extends StandardSchemaV1>(
   schema: T,
   input: StandardSchemaV1.InferInput<T>,
): Promise<StandardSchemaV1.InferOutput<T>> {
   let result = schema['~standard'].validate(input)
   if (result instanceof Promise) result = await result

   // if the `issues` field exists, the validation failed
   if (result.issues) {
      throw new Error(JSON.stringify(result.issues, null, 2))
   }

   return result.value
}

Deno.test('GraphQLStandardSchema should work as expected when no options are provided', async () => {
   const schema = graphQLResponseSchema()

   assertEquals(schema['~standard'].vendor, 'dreamit')
   assertEquals(schema['~standard'].version, 1)

   // Case: Value is a string and parseStringToObject is false
   await assertRejects(
      async () => {
         await standardValidate(schema, 'string')
      },
      Error,
      'Provided value is a string and \\"parseStringToObject\\" option is disabled',
   )

   // Case: Value is an object but undefined
   await assertRejects(
      async () => {
         await standardValidate(schema, {})
      },
      Error,
      'GraphQL response should contain at least one of data or error field, but both are missing.',
   )

   // Case: Data is set and valid
   assertEquals(
      await standardValidate(schema, { data: { message: 'OK' } }),
      { data: { message: 'OK' } },
   )
})

Deno.test('GraphQLStandardSchema should work as expected when parseStringToObject is enabled', async () => {
   const schema = graphQLResponseSchema({ parseStringToObject: true })

   // Case: Value is a string and parseStringToObject is false
   await assertRejects(
      async () => {
         await standardValidate(schema, 'string')
      },
      Error,
      'String value could not be parsed to object. Error is SyntaxError: Unexpected token \'s\', \\"string\\" is not valid JSON"',
   )
})

Deno.test('findIssues should find expected issues', () => {
   // Case: Both data and errors missing
   assertEquals(
      findIssues({}).at(0)?.message,
      'GraphQL response should contain at least one of data or error field, but both are missing.',
   )

   // Case: Both data and errors set and allowBothErrorsAndDataFields is false
   assertEquals(
      findIssues({ data: { message: 'data' }, errors: ['errors'] }).at(0)
         ?.message,
      'GraphQL response contains both data and errors fields but should contain only one of them.',
   )
   // Case: Both data and errors set and allowBothErrorsAndDataFields is true
   assertEquals(
      findIssues({ data: { message: 'data' }, errors: ['errors'] }, {
         allowBothErrorsAndDataFields: true,
      }).length,
      0,
   )

   // Case: Errors is set but empty
   assertEquals(
      findIssues({ errors: [] }).at(0)
         ?.message,
      'GraphQL response contains empty "errors" field but should at least have one error entry.',
   )

   // Case: Data is set but not an object
   assertEquals(
      findIssues({ data: 'string' }).at(0)
         ?.message,
      'GraphQL response contains "data" field of type "string" but "data" should be an "object".',
   )

   // Case: Data is set but not an object
   assertEquals(
      findIssues({ errors: 'string' }).at(0)
         ?.message,
      'GraphQL response contains "errors" field of type "string" but "errors" should be an "array".',
   )

   // Case: Extensions is set but not an object
   assertEquals(
      findIssues({ data: {}, extensions: 'string' }).at(0)
         ?.message,
      'GraphQL response contains "extensions" field of type "string" but "extensions" should be an "object".',
   )

   // Case: Additional field myCustomField is set and allowAdditionalFieldsInResponse is false
   assertEquals(
      findIssues({ data: {}, myCustomField: 'string' }).at(0)
         ?.message,
      'GraphQL response should contain only "data", "errors" or "extensions" fields but has the following fields: "myCustomField".',
   )
   // Case: Additional field myCustomField is set and allowAdditionalFieldsInResponse is true
   assertEquals(
      findIssues({ data: {}, myCustomField: 'string' }, {
         allowAdditionalFieldsInResponse: true,
      }).length,
      0,
   )
})
