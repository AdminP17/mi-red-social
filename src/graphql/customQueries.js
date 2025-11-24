// src/graphql/customQueries.js

export const listUserProfiles = /* GraphQL */ `
  query ListUserProfiles($filter: ModelUserProfileFilterInput) {
    listUserProfiles(filter: $filter) {
      items {
        id
        username
        bio
        avatar
      }
    }
  }
`;
