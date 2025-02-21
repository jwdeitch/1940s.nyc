import express from 'express';
const router = express.Router();

import querystring from 'querystring';

import { getRepository } from 'typeorm';
import Photo from '../entities/Photo';

const PHOTO_PURCHASE_FORM_URL = 'https://www1.nyc.gov/dorforms/photoform.htm';

// Get photos by matching lng,lat
router.get('/', async (req, res) => {
  const photoRepo = getRepository(Photo);

  let { lng, lat } = req.query;

  const { withSameLngLatByIdentifier } = req.query;

  if (withSameLngLatByIdentifier) {
    const [lngLatForFromIdentifierResult] = await photoRepo.query(
      'select lng_lat from effective_geocodes_view where identifier = $1',
      [withSameLngLatByIdentifier]
    );

    if (!lngLatForFromIdentifierResult) {
      res.status(401).send('cannot find by identifier');
      return;
    }

    // Use lng, lat from this photo instead of lng, lat parameters
    lng = lngLatForFromIdentifierResult.lng_lat.x;
    lat = lngLatForFromIdentifierResult.lng_lat.y;
  }

  if (!lng || !lat) {
    res.status(401).send('lngLat required');
    return;
  }
  const result = await photoRepo.query(
    'select identifier from effective_geocodes_view where lng_lat ~= point($1, $2)',
    [lng, lat]
  );

  const ids = result.map((r) => r.identifier);

  const photos = await photoRepo.findByIds(ids, {
    order: { collection: 'ASC' },
    relations: ['geocodeResults'],
    loadEagerRelations: true,
  });
  res.send(photos);
});

router.get('/closest', async (req, res) => {
  const photoRepo = getRepository(Photo);
  const result = await photoRepo.query(
    'SELECT *, lng_lat<@>point($1, $2) AS distance FROM effective_geocodes_view WHERE collection = $3 ORDER BY distance LIMIT 1',
    [req.query.lng, req.query.lat, req.query.collection ?? '1940']
  );

  if (!result.length) {
    res.status(404);
    res.send();
    return;
  }

  const photo = await photoRepo.findOne(result[0].identifier);
  res.send(photo);
});

router.get('/outtake-summaries', async (req, res) => {
  const photoRepo = getRepository(Photo);

  const photos = await photoRepo.find({
    where: { isOuttake: true, collection: req.query.collection ?? '1940' },
    select: ['identifier'],
    order: {
      identifier: 'ASC',
    },
  });

  res.send(photos);
});

router.get('/:identifier', async (req, res) => {
  const photoRepo = getRepository(Photo);

  const photo = await photoRepo.findOne(req.params.identifier, {
    relations: ['geocodeResults'],
    loadEagerRelations: true,
  });
  if (!photo) {
    res.status(404);
    res.send();
    return;
  }
  res.send(photo);
});

router.get('/:identifier/buy-prints', async (req, res) => {
  const photoRepo = getRepository(Photo);

  const photo = await photoRepo.findOne(req.params.identifier);
  if (!photo) {
    res.status(404);
    res.send();
    return;
  }

  const formParams = {
    collection: photo.collection,
    lot: photo.lot ? Number(photo.lot) : undefined,
    streetName: photo.streetName,
    imageIdentifier: photo.identifier,
    buildingNumber: photo.bldgNumberStart,
    block: photo.block,
    borough: photo.borough,
  };

  const formUrl =
    PHOTO_PURCHASE_FORM_URL + '?' + querystring.stringify(formParams);
  res.redirect(formUrl);
});

export default router;
