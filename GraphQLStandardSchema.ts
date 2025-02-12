import type { StandardSchemaV1 } from './StandardSchemaV1.ts'

export interface ValidationOptions {
   /**
    * In a GraphQL response only the fields "data", "errors" and "extensions" are allowed. When set to true
    * this checks allows additional fields. According to GraphQL spec October 2021 this should not be the case.
    */
   allowAdditionalFieldsInResponse?: boolean

   /**
    * Defines if both "errors" and "data" fields are allowed in the response.
    * According to GraphQL spec October 2021 this should not be the case.
    */
   allowBothErrorsAndDataFields?: boolean

   /**
    * If value is a string, define if it should be parsed to an object. Otherwise an issue will be created.
    */
   parseStringToObject?: boolean
}

/**
 * Checks for issues in the response object with the given options
 * @param {any} response - The response object
 * @param {ValidationOptions} options -  The optional validation options for the schema validation
 * @returns
 */
export function findIssues(
   // deno-lint-ignore no-explicit-any
   response: any,
   options?: ValidationOptions,
): StandardSchemaV1.Issue[] {
   const foundIssues: StandardSchemaV1.Issue[] = []

   if (!response.data && !response.errors) {
      foundIssues.push({
         message:
            'GraphQL response should contain at least one of data or error field, but both are missing.',
      })
   } else if (
      response.data && response.errors &&
      (!options || !options.allowBothErrorsAndDataFields)
   ) {
      foundIssues.push({
         message:
            'GraphQL response contains both data and errors fields but should contain only one of them.',
      })
   }

   if (
      response.data && response.data !== null &&
      typeof response.data !== 'object'
   ) {
      foundIssues.push({
         message:
            `GraphQL response contains "data" field of type "${typeof response
               .data}" but "data" should be an "object".`,
      })
   }

   if (
      response.errors &&
      !Array.isArray(response.errors)
   ) {
      foundIssues.push({
         message:
            `GraphQL response contains "errors" field of type "${typeof response
               .errors}" but "errors" should be an "array".`,
      })
   }

   if (
      response.errors &&
      Array.isArray(response.errors) &&
      response.errors.length < 1
   ) {
      foundIssues.push({
         message:
            'GraphQL response contains empty "errors" field but should at least have one error entry.',
      })
   }

   if (
      response.extensions &&
      typeof response.extensions !== 'object'
   ) {
      foundIssues.push({
         message:
            `GraphQL response contains "extensions" field of type "${typeof response
               .extensions}" but "extensions" should be an "object".`,
      })
   }

   if (!options || !options.allowAdditionalFieldsInResponse) {
      const additionalProperties = Object.getOwnPropertyNames(
         response,
      ).filter((property) =>
         property !== 'data' && property !== 'errors' &&
         property !== 'extensions'
      )
      if (additionalProperties.length > 0) {
         foundIssues.push({
            message:
               `GraphQL response should contain only "data", "errors" or "extensions" fields but has the following fields: "${additionalProperties}".`,
         })
      }
   }
   return foundIssues
}

/**
 * Creates a GraphQL response schema
 * @param {ValidationOptions} options - The optional validation options for the schema validation
 * @returns {StandardSchemaV1<object>} The GraphQL response Standard Schema
 */
export function graphQLResponseSchema(
   options?: ValidationOptions,
): StandardSchemaV1<object | string> {
   return {
      '~standard': {
         version: 1,
         vendor: 'dreamit',
         validate(value) {
            /*
             * Check type of value. If value is a string and parseStringToObject option is enabled try to parse it
             * to an object so we can check if. If it is neither an object nor a string return an issue.
             */
            let responseAsObject
            if (typeof value === 'string') {
               if (!options || !options.parseStringToObject) {
                  return {
                     issues: [
                        {
                           message:
                              'Provided value is a string and "parseStringToObject" option is disabled',
                        },
                     ],
                  }
               } else {
                  try {
                     responseAsObject = JSON.parse(value)
                  } catch (error) {
                     return {
                        issues: [
                           {
                              message:
                                 `String value could not be parsed to object. Error is ${error}`,
                           },
                        ],
                     }
                  }
               }
            } else if (typeof value === 'object') {
               responseAsObject = value
            }

            const foundIssues = findIssues(responseAsObject, options)

            return foundIssues.length > 0
               ? { issues: foundIssues }
               : { value: responseAsObject }
         },
      },
   }
}
