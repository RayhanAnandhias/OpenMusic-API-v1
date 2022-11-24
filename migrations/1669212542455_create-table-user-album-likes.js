/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('user_album_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      references: '"users"',
      onDelete: 'CASCADE',
      notNull: true,
    },
    album_id: {
      type: 'VARCHAR(50)',
      references: '"albums"',
      onDelete: 'CASCADE',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('user_album_likes');
};
