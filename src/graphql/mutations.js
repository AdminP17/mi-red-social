/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createUserProfile = /* GraphQL */ `
  mutation CreateUserProfile(
    $input: CreateUserProfileInput!
    $condition: ModelUserProfileConditionInput
  ) {
    createUserProfile(input: $input, condition: $condition) {
      id
      username
      bio
      avatar
      coverImage
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
export const updateUserProfile = /* GraphQL */ `
  mutation UpdateUserProfile(
    $input: UpdateUserProfileInput!
    $condition: ModelUserProfileConditionInput
  ) {
    updateUserProfile(input: $input, condition: $condition) {
      id
      username
      bio
      avatar
      coverImage
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
export const deleteUserProfile = /* GraphQL */ `
  mutation DeleteUserProfile(
    $input: DeleteUserProfileInput!
    $condition: ModelUserProfileConditionInput
  ) {
    deleteUserProfile(input: $input, condition: $condition) {
      id
      username
      bio
      avatar
      coverImage
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
export const createPost = /* GraphQL */ `
  mutation CreatePost(
    $input: CreatePostInput!
    $condition: ModelPostConditionInput
  ) {
    createPost(input: $input, condition: $condition) {
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
        coverImage
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
export const updatePost = /* GraphQL */ `
  mutation UpdatePost(
    $input: UpdatePostInput!
    $condition: ModelPostConditionInput
  ) {
    updatePost(input: $input, condition: $condition) {
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
        coverImage
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
export const deletePost = /* GraphQL */ `
  mutation DeletePost(
    $input: DeletePostInput!
    $condition: ModelPostConditionInput
  ) {
    deletePost(input: $input, condition: $condition) {
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
        coverImage
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
export const createComment = /* GraphQL */ `
  mutation CreateComment(
    $input: CreateCommentInput!
    $condition: ModelCommentConditionInput
  ) {
    createComment(input: $input, condition: $condition) {
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
        coverImage
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
export const updateComment = /* GraphQL */ `
  mutation UpdateComment(
    $input: UpdateCommentInput!
    $condition: ModelCommentConditionInput
  ) {
    updateComment(input: $input, condition: $condition) {
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
        coverImage
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
export const deleteComment = /* GraphQL */ `
  mutation DeleteComment(
    $input: DeleteCommentInput!
    $condition: ModelCommentConditionInput
  ) {
    deleteComment(input: $input, condition: $condition) {
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
        coverImage
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
export const createLike = /* GraphQL */ `
  mutation CreateLike(
    $input: CreateLikeInput!
    $condition: ModelLikeConditionInput
  ) {
    createLike(input: $input, condition: $condition) {
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
        coverImage
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
export const updateLike = /* GraphQL */ `
  mutation UpdateLike(
    $input: UpdateLikeInput!
    $condition: ModelLikeConditionInput
  ) {
    updateLike(input: $input, condition: $condition) {
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
        coverImage
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
export const deleteLike = /* GraphQL */ `
  mutation DeleteLike(
    $input: DeleteLikeInput!
    $condition: ModelLikeConditionInput
  ) {
    deleteLike(input: $input, condition: $condition) {
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
        coverImage
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
export const createFollow = /* GraphQL */ `
  mutation CreateFollow(
    $input: CreateFollowInput!
    $condition: ModelFollowConditionInput
  ) {
    createFollow(input: $input, condition: $condition) {
      id
      followerID
      followedID
      follower {
        id
        username
        bio
        avatar
        coverImage
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
        coverImage
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
export const updateFollow = /* GraphQL */ `
  mutation UpdateFollow(
    $input: UpdateFollowInput!
    $condition: ModelFollowConditionInput
  ) {
    updateFollow(input: $input, condition: $condition) {
      id
      followerID
      followedID
      follower {
        id
        username
        bio
        avatar
        coverImage
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
        coverImage
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
export const deleteFollow = /* GraphQL */ `
  mutation DeleteFollow(
    $input: DeleteFollowInput!
    $condition: ModelFollowConditionInput
  ) {
    deleteFollow(input: $input, condition: $condition) {
      id
      followerID
      followedID
      follower {
        id
        username
        bio
        avatar
        coverImage
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
        coverImage
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
export const createNotification = /* GraphQL */ `
  mutation CreateNotification(
    $input: CreateNotificationInput!
    $condition: ModelNotificationConditionInput
  ) {
    createNotification(input: $input, condition: $condition) {
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
        coverImage
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
        coverImage
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
export const updateNotification = /* GraphQL */ `
  mutation UpdateNotification(
    $input: UpdateNotificationInput!
    $condition: ModelNotificationConditionInput
  ) {
    updateNotification(input: $input, condition: $condition) {
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
        coverImage
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
        coverImage
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
export const deleteNotification = /* GraphQL */ `
  mutation DeleteNotification(
    $input: DeleteNotificationInput!
    $condition: ModelNotificationConditionInput
  ) {
    deleteNotification(input: $input, condition: $condition) {
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
        coverImage
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
        coverImage
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
export const createChat = /* GraphQL */ `
  mutation CreateChat(
    $input: CreateChatInput!
    $condition: ModelChatConditionInput
  ) {
    createChat(input: $input, condition: $condition) {
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
export const updateChat = /* GraphQL */ `
  mutation UpdateChat(
    $input: UpdateChatInput!
    $condition: ModelChatConditionInput
  ) {
    updateChat(input: $input, condition: $condition) {
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
export const deleteChat = /* GraphQL */ `
  mutation DeleteChat(
    $input: DeleteChatInput!
    $condition: ModelChatConditionInput
  ) {
    deleteChat(input: $input, condition: $condition) {
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
export const createMessage = /* GraphQL */ `
  mutation CreateMessage(
    $input: CreateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    createMessage(input: $input, condition: $condition) {
      id
      chatID
      content
      senderID
      sender {
        id
        username
        bio
        avatar
        coverImage
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
export const updateMessage = /* GraphQL */ `
  mutation UpdateMessage(
    $input: UpdateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    updateMessage(input: $input, condition: $condition) {
      id
      chatID
      content
      senderID
      sender {
        id
        username
        bio
        avatar
        coverImage
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
export const deleteMessage = /* GraphQL */ `
  mutation DeleteMessage(
    $input: DeleteMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    deleteMessage(input: $input, condition: $condition) {
      id
      chatID
      content
      senderID
      sender {
        id
        username
        bio
        avatar
        coverImage
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
