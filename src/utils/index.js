const mapAlbumsModel = ({ id, name, year, songs }) => ({
  id,
  name,
  year,
  songs,
});

const mapSongsModel = ({ id, title, performer }) => ({
  id,
  title,
  performer,
});

const mapSongDetailModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id,
});

module.exports = {
  mapAlbumsModel,
  mapSongsModel,
  mapSongDetailModel,
};
