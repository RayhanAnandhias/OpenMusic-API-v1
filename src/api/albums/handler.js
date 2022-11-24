const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, storageService, validator, storageValidator) {
    this._service = service;
    this._storageService = storageService;
    this._validator = validator;
    this._storageValidator = storageValidator;
    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this._service.addAlbum({ name, year });
    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const response = h.response({
      status: 'success',
      data: {
        album,
      },
    });
    response.code(200);
    return response;
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    const { name, year } = request.payload;
    await this._service.putAlbumById(id, { name, year });
    const response = h.response({
      status: 'success',
      message: 'Album berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    const response = h.response({
      status: 'success',
      message: 'Album berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  async postUploadCoverAlbumHandler(request, h) {
    const { cover } = request.payload;
    this._storageValidator.validateImageHeaders(cover.hapi.headers);
    const { id } = request.params;

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const coverUrl = this._service.constructCoverUrl(filename);

    await this._service.putAlbumCover(id, coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async postLikesAlbums(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;

    await this._service.verifyAlbumExistency(id);

    let message = '';
    if (await this._service.isAlbumLiked(id, credentialId)) {
      await this._service.dislikesAlbum(id, credentialId);
      message = 'Berhasil dislike album';
    } else {
      await this._service.likesAlbum(id, credentialId);
      message = 'Berhasil menyukai album';
    }

    const response = h.response({
      status: 'success',
      message,
    });
    response.code(201);
    return response;
  }

  async getTotalAlbumLikes(request, h) {
    const { id } = request.params;

    await this._service.verifyAlbumExistency(id);
    const likes = await this._service.countAlbumLikes(id);

    const response = h.response({
      status: 'success',
      data: likes.data,
    });
    if (likes.isDataFromCache) {
      response.header('X-Data-Source', 'cache');
    }
    response.code(200);
    return response;
  }
}

module.exports = AlbumsHandler;
