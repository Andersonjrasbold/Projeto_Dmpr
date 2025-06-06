const Pool = require('pg').Pool

const pool = new Pool({

  user: 'postgres',

  host: 'localhost',

  database: 'farmaoferta',

  password: 'postgres',

  port: 5432,

})

module.exports = (app) => {

    let route = app.route('/users');

    route.get((req, res) => {

        pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {

                if (error) {
            
                    app.utils.error.send(err, req, res);
            
                } else {
            
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                res.json(results.rows);

            }
        });
    
        });
    
    route.post((req, res) => {

        if (!app.utils.validator.user(app, req, res)) return false;

        pool.insert(req.body, (err, user) =>{

            if (err) {

                app.utils.error.send(err, req, res);

            } else {

                res.status(200).json(user)

            }

        });
    
    });

    let routeId = app.route('/users/:id');

    routeId.get((req, res)=>{

        pool.findOne({_id:req.params.id}).exec((err, user)=>{

            if (err) {

                app.utils.error.send(err, req, res);

            } else {

                res.status(200).json(user)

            }

        });

    });

    routeId.put((req, res)=>{

        if (!app.utils.validator.user(app, req, res)) return false;

        pool.update({_id:req.params.id}, req.body, err=>{

            if (err) {

                app.utils.error.send(err, req, res);

            } else {

                res.status(200).json(Object.assign(req.params, req.body));

            }

        });

    });

    routeId.delete((req, res)=>{
        
        pool.remove({_id:req.params.id}, {}, err=>{
            if (err) {

                app.utils.error.send(err, req, res);

            } else {

                res.status(200).json(req.params);

            }
        });
    });

};