from flask import render_template, g

from thanados import app
from thanados.models.entity import Data


@app.route('/sites')
def sites():
    site_list = Data.get_list()

    sql_places = """
    DROP TABLE IF EXISTS thanados.tmp_places;
    CREATE TABLE thanados.tmp_places AS
   SELECT 
	m.id,
	m.name,
	m.description,
	m.begin_from,
	m.begin_to,
	m.begin_comment,
	m.end_from,
	m.end_to,
	m.end_comment,
	l.range_id AS location_id,
	ST_AsGeoJSON(ST_PointOnSurface(p.geom))::JSONB AS geometry
	FROM model.entity m 
	JOIN model.link l ON m.id = l.domain_id 
	LEFT JOIN gis.polygon p ON l.range_id = p.entity_id
	WHERE m.system_type = 'place' AND l.property_code = 'P53' ORDER BY m.name;

UPDATE thanados.tmp_places SET geometry = s.geom FROM (SELECT entity_id, ST_AsGeoJSON(geom)::JSONB as geom FROM gis.point) s
	WHERE s.entity_id = location_id;

DELETE FROM thanados.tmp_places WHERE geometry ISNULL;

DROP TABLE IF EXISTS thanados.tmp_ids;
CREATE TABLE thanados.tmp_ids AS
	SELECT DISTINCT id,
	NULL::text AS name,
	NULL::JSONB AS geometry 
	FROM thanados.tmp_places;

UPDATE thanados.tmp_ids i SET geometry = p.geometry FROM thanados.tmp_places p WHERE p.id = i.id;
UPDATE thanados.tmp_ids i SET name = p.name FROM thanados.tmp_places p WHERE p.id = i.id;

SELECT (jsonb_strip_nulls(jsonb_build_object(
               'type', 'FeatureCollection',
               'features', jsonb_strip_nulls(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
               'type', 'Feature',
               'geometry', f.geometry,
               'id', f.id,
               'name', f.name
           ))))))) AS places FROM thanados.tmp_ids f
        """
    g.cursor.execute(sql_places)
    places = g.cursor.fetchall()

    return render_template('/sites/sites.html', sitelist=site_list[0].sitelist, placeJSON=places[0].places)
