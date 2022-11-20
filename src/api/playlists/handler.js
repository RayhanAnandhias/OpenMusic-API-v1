class PlaylistsHandler {
  constructor(playlistsService, songsService, validator) {
    this._service = playlistsService;
    this._songsService = songsService;
    this._validator = validator;
    this.addPlaylistHandler = this.addPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.getPlaylistsSongsHandler = this.getPlaylistsSongsHandler.bind(this);
    this.addSongToPlaylistHandler = this.addSongToPlaylistHandler.bind(this);
    this.deleteSongFromPlaylistHandler =
      this.deleteSongFromPlaylistHandler.bind(this);
  }

  async addPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;
    const playlistId = await this._service.addPlaylist(name, owner);
    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);
    const response = h.response({
      status: 'success',
      data: {
        playlists,
      },
    });
    response.code(200);
    return response;
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.deletePlaylistById(id, credentialId);
    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  async getPlaylistsSongsHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const playlist = await this._service.getPlaylistsSongs(id, credentialId);
    const response = h.response({
      status: 'success',
      data: {
        playlist,
      },
    });
    response.code(200);
    return response;
  }

  async addSongToPlaylistHandler(request, h) {
    this._validator.validateAddPlaylistSongPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;
    const { songId } = request.payload;
    await this._songsService.verifySongExistency(songId);
    await this._service.addSongToPlaylist(id, songId, credentialId);
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke Playlist',
    });
    response.code(201);
    return response;
  }

  async deleteSongFromPlaylistHandler(request, h) {
    this._validator.validateDeletePlaylistSongPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;
    const { songId } = request.payload;
    await this._service.deleteSongFromPlaylist(id, songId, credentialId);
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus dari Playlist',
    });
    response.code(200);
    return response;
  }
}

module.exports = PlaylistsHandler;
