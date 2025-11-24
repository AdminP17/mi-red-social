import api from "./api";

class FollowService {
  async followUser(targetUserId) {
    const { data } = await api.post(`/follow/${targetUserId}`);
    return data;
  }

  async unfollowUser(targetUserId) {
    const { data } = await api.delete(`/follow/${targetUserId}`);
    return data;
  }

  async getFollowers(userId) {
    const { data } = await api.get(`/follow/${userId}/followers`);
    return data;
  }

  async getFollowing(userId) {
    const { data } = await api.get(`/follow/${userId}/following`);
    return data;
  }

  async isFollowing(userId) {
    const { data } = await api.get(`/follow/is-following/${userId}`);
    return data;
  }
}

const followService = new FollowService(); // ✔ instancia con nombre

export default followService; // ✔ exportación no anónima
