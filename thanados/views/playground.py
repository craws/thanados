from flask import render_template, g

from thanados import app


@app.route('/')
@app.route('/playground')
def playground():
    sql_persons = """
    SELECT jsonb_agg(
jsonb_build_object(
	'name', persons.name,
	'description', persons.description
)
) AS persons FROM
(SELECT 
  name, 
  description
FROM 
  model.entity
WHERE 
  class_code = 'E21') AS persons;
    """
    g.cursor.execute(sql_persons)
    persons = g.cursor.fetchone()

    return render_template("/playground/playground.html", person_data=persons[0])
