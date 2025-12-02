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
      notificationsSent {
        nextToken
        __typename
      }
      notificationsReceived {
        nextToken
        __typename
      }
      messagesSent {
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
      notificationsSent {
        nextToken
        __typename
      }
      notificationsReceived {
        nextToken
        __typename
      }
      messagesSent {
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
      notificationsSent {
        nextToken
        __typename
      }
      notificationsReceived {
        nextToken
        __typename
      }
      messagesSent {
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
export const onCreateNotification = /* GraphQL */ `
  subscription OnCreateNotification(
    $filter: ModelSubscriptionNotificationFilterInput
    $owner: String
  ) {
    onCreateNotification(filter: $filter, owner: $owner) {
      id
      type
      content
      isRead
      senderID
      receiverID
      postID
      sender {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
      receiver {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
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
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onUpdateNotification = /* GraphQL */ `
  subscription OnUpdateNotification(
    $filter: ModelSubscriptionNotificationFilterInput
    $owner: String
  ) {
    onUpdateNotification(filter: $filter, owner: $owner) {
      id
      type
      content
      isRead
      senderID
      receiverID
      postID
      sender {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
      receiver {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
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
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onDeleteNotification = /* GraphQL */ `
  subscription OnDeleteNotification(
    $filter: ModelSubscriptionNotificationFilterInput
    $owner: String
  ) {
    onDeleteNotification(filter: $filter, owner: $owner) {
      id
      type
      content
      isRead
      senderID
      receiverID
      postID
      sender {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
      receiver {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
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
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onCreateChat = /* GraphQL */ `
  subscription OnCreateChat(
    $filter: ModelSubscriptionChatFilterInput
    $owner: String
  ) {
    onCreateChat(filter: $filter, owner: $owner) {
      id
      participants
      messages {
        nextToken
        __typename
      }
      updatedAt
      createdAt
      owner
      __typename
    }
  }
`;
export const onUpdateChat = /* GraphQL */ `
  subscription OnUpdateChat(
    $filter: ModelSubscriptionChatFilterInput
    $owner: String
  ) {
    onUpdateChat(filter: $filter, owner: $owner) {
      id
      participants
      messages {
        nextToken
        __typename
      }
      updatedAt
      createdAt
      owner
      __typename
    }
  }
`;
export const onDeleteChat = /* GraphQL */ `
  subscription OnDeleteChat(
    $filter: ModelSubscriptionChatFilterInput
    $owner: String
  ) {
    onDeleteChat(filter: $filter, owner: $owner) {
      id
      participants
      messages {
        nextToken
        __typename
      }
      updatedAt
      createdAt
      owner
      __typename
    }
  }
`;
export const onCreateMessage = /* GraphQL */ `
  subscription OnCreateMessage(
    $filter: ModelSubscriptionMessageFilterInput
    $owner: String
  ) {
    onCreateMessage(filter: $filter, owner: $owner) {
      id
      chatID
      content
      senderID
      sender {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
      chat {
        id
        participants
        updatedAt
        createdAt
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
export const onUpdateMessage = /* GraphQL */ `
  subscription OnUpdateMessage(
    $filter: ModelSubscriptionMessageFilterInput
    $owner: String
  ) {
    onUpdateMessage(filter: $filter, owner: $owner) {
      id
      chatID
      content
      senderID
      sender {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
      chat {
        id
        participants
        updatedAt
        createdAt
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
export const onDeleteMessage = /* GraphQL */ `
  subscription OnDeleteMessage(
    $filter: ModelSubscriptionMessageFilterInput
    $owner: String
  ) {
    onDeleteMessage(filter: $filter, owner: $owner) {
      id
      chatID
      content
      senderID
      sender {
        id
        username
        bio
        avatar
        createdAt
        updatedAt
        owner
        __typename
      }
      chat {
        id
        participants
        updatedAt
        createdAt
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
      notifications {
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
      notifications {
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
      notifications {
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
