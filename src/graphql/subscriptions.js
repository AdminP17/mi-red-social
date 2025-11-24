/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUserProfile = /* GraphQL */ `
  subscription OnCreateUserProfile(
    $filter: ModelSubscriptionUserProfileFilterInput
    $owner: String
  ) {
    onCreateUserProfile(filter: $filter, owner: $owner) {
      id
      username
      bio
      avatar
      posts {
        nextToken
        __typename
      }
      comments {
        nextToken
        __typename
      }
      likes {
        nextToken
        __typename
      }
      followers {
        nextToken
        __typename
      }
      following {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onUpdateUserProfile = /* GraphQL */ `
  subscription OnUpdateUserProfile(
    $filter: ModelSubscriptionUserProfileFilterInput
    $owner: String
  ) {
    onUpdateUserProfile(filter: $filter, owner: $owner) {
      id
      username
      bio
      avatar
      posts {
        nextToken
        __typename
      }
      comments {
        nextToken
        __typename
      }
      likes {
        nextToken
        __typename
      }
      followers {
        nextToken
        __typename
      }
      following {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onDeleteUserProfile = /* GraphQL */ `
  subscription OnDeleteUserProfile(
    $filter: ModelSubscriptionUserProfileFilterInput
    $owner: String
  ) {
    onDeleteUserProfile(filter: $filter, owner: $owner) {
      id
      username
      bio
      avatar
      posts {
        nextToken
        __typename
      }
      comments {
        nextToken
        __typename
      }
      likes {
        nextToken
        __typename
      }
      followers {
        nextToken
        __typename
      }
      following {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onCreatePost = /* GraphQL */ `
  subscription OnCreatePost(
    $filter: ModelSubscriptionPostFilterInput
    $owner: String
  ) {
    onCreatePost(filter: $filter, owner: $owner) {
      id
      userID
      content
      media
      createdAt
      updatedAt
      user {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
      comments {
        nextToken
        __typename
      }
      likes {
        nextToken
        __typename
      }
      owner
      __typename
    }
  }
`;
export const onUpdatePost = /* GraphQL */ `
  subscription OnUpdatePost(
    $filter: ModelSubscriptionPostFilterInput
    $owner: String
  ) {
    onUpdatePost(filter: $filter, owner: $owner) {
      id
      userID
      content
      media
      createdAt
      updatedAt
      user {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
      comments {
        nextToken
        __typename
      }
      likes {
        nextToken
        __typename
      }
      owner
      __typename
    }
  }
`;
export const onDeletePost = /* GraphQL */ `
  subscription OnDeletePost(
    $filter: ModelSubscriptionPostFilterInput
    $owner: String
  ) {
    onDeletePost(filter: $filter, owner: $owner) {
      id
      userID
      content
      media
      createdAt
      updatedAt
      user {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
      comments {
        nextToken
        __typename
      }
      likes {
        nextToken
        __typename
      }
      owner
      __typename
    }
  }
`;
export const onCreateComment = /* GraphQL */ `
  subscription OnCreateComment(
    $filter: ModelSubscriptionCommentFilterInput
    $owner: String
  ) {
    onCreateComment(filter: $filter, owner: $owner) {
      id
      postID
      userID
      content
      createdAt
      post {
        id
        userID
        content
        media
        createdAt
        updatedAt
        owner
        __typename
      }
      user {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
      updatedAt
      owner
      __typename
    }
  }
`;
export const onUpdateComment = /* GraphQL */ `
  subscription OnUpdateComment(
    $filter: ModelSubscriptionCommentFilterInput
    $owner: String
  ) {
    onUpdateComment(filter: $filter, owner: $owner) {
      id
      postID
      userID
      content
      createdAt
      post {
        id
        userID
        content
        media
        createdAt
        updatedAt
        owner
        __typename
      }
      user {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
      updatedAt
      owner
      __typename
    }
  }
`;
export const onDeleteComment = /* GraphQL */ `
  subscription OnDeleteComment(
    $filter: ModelSubscriptionCommentFilterInput
    $owner: String
  ) {
    onDeleteComment(filter: $filter, owner: $owner) {
      id
      postID
      userID
      content
      createdAt
      post {
        id
        userID
        content
        media
        createdAt
        updatedAt
        owner
        __typename
      }
      user {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
      updatedAt
      owner
      __typename
    }
  }
`;
export const onCreateLike = /* GraphQL */ `
  subscription OnCreateLike(
    $filter: ModelSubscriptionLikeFilterInput
    $owner: String
  ) {
    onCreateLike(filter: $filter, owner: $owner) {
      id
      postID
      userID
      post {
        id
        userID
        content
        media
        createdAt
        updatedAt
        owner
        __typename
      }
      user {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onUpdateLike = /* GraphQL */ `
  subscription OnUpdateLike(
    $filter: ModelSubscriptionLikeFilterInput
    $owner: String
  ) {
    onUpdateLike(filter: $filter, owner: $owner) {
      id
      postID
      userID
      post {
        id
        userID
        content
        media
        createdAt
        updatedAt
        owner
        __typename
      }
      user {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onDeleteLike = /* GraphQL */ `
  subscription OnDeleteLike(
    $filter: ModelSubscriptionLikeFilterInput
    $owner: String
  ) {
    onDeleteLike(filter: $filter, owner: $owner) {
      id
      postID
      userID
      post {
        id
        userID
        content
        media
        createdAt
        updatedAt
        owner
        __typename
      }
      user {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onCreateFollow = /* GraphQL */ `
  subscription OnCreateFollow(
    $filter: ModelSubscriptionFollowFilterInput
    $owner: String
  ) {
    onCreateFollow(filter: $filter, owner: $owner) {
      id
      followerID
      followedID
      follower {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
      followed {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onUpdateFollow = /* GraphQL */ `
  subscription OnUpdateFollow(
    $filter: ModelSubscriptionFollowFilterInput
    $owner: String
  ) {
    onUpdateFollow(filter: $filter, owner: $owner) {
      id
      followerID
      followedID
      follower {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
      followed {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onDeleteFollow = /* GraphQL */ `
  subscription OnDeleteFollow(
    $filter: ModelSubscriptionFollowFilterInput
    $owner: String
  ) {
    onDeleteFollow(filter: $filter, owner: $owner) {
      id
      followerID
      followedID
      follower {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
      followed {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
