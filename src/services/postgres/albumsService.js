const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      port: process.env.PGPORT,
    });
    this._cacheService = cacheService;
  }

  constructCoverUrl(filename) {
    return `http://${process.env.HOST}:${process.env.PORT}/album/images/${filename}`;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'select a.id, a."name", a."year", a.cover, s.id as song_id, s.title, s.performer from albums as a left join songs as s on a.id = s.album_id WHERE a.id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const songs = result.rows
      .map(({ song_id, title, performer }) => {
        if (song_id || title || performer) {
          return {
            id: song_id,
            title,
            performer,
          };
        }
        return null;
      })
      .filter((v) => v);

    return result.rows.map(({ id, name, year, cover }) => ({
      id,
      name,
      year,
      coverUrl: cover,
      songs,
    }))[0];
  }

  async putAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async putAlbumCover(id, coverUrl) {
    const query = {
      text: `UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id`,
      values: [coverUrl, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async likesAlbum(albumId, userId) {
    const id = nanoid(16);
    const query = {
      text: `INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id`,
      values: [id, userId, albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menyukai album');
    }
    await this._cacheService.delete(`albums:${albumId}`);
  }

  async dislikesAlbum(albumId, userId) {
    const query = {
      text: `DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id`,
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Gagal dislike album');
    }
    await this._cacheService.delete(`albums:${albumId}`);
  }

  async isAlbumLiked(albumId, userId) {
    const query = {
      text: `SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2`,
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);
    return Boolean(result.rows.length);
  }

  async countAlbumLikes(albumId) {
    try {
      const result = await this._cacheService.get(`albums:${albumId}`);
      return {
        isDataFromCache: true,
        data: JSON.parse(result),
      };
    } catch (error) {
      const query = {
        text: `SELECT CAST(COUNT(album_id) AS INTEGER) AS count_likes FROM user_album_likes WHERE album_id = $1`,
        values: [albumId],
      };
      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new NotFoundError('Tidak ada data album');
      }

      const mappedResult = result.rows.map(({ count_likes }) => ({
        likes: count_likes,
      }))[0];

      await this._cacheService.set(
        `albums:${albumId}`,
        JSON.stringify(mappedResult),
      );

      return {
        isDataFromCache: false,
        data: mappedResult,
      };
    }
  }

  async verifyAlbumExistency(albumId) {
    const query = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
