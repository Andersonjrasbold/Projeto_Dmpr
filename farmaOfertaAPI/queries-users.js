const Pool = require('pg').Pool

const pool = new Pool({

  user: 'postgres',

  host: 'localhost',

  database: 'farmaoferta',

  password: 'postgres',

  port: 5432,

})

const getUsers = (request, response) => {

  pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {

    if (error) {

      throw error

    }

    response.status(200).json(results.rows)

  })

}



const getUserById = (request, response) => {

  const id = parseInt(request.params.id)



  pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {

    if (error) {

      throw error

    }

    response.status(200).json(results.rows)

  })

}



const createUser = (request, response) => {

  
  const id = parseInt(request.params.id)

  const { name, lastname } = request.body

  console.log(request.body);

  pool.query('INSERT INTO users (id, name, lastname) VALUES ($1, $2, $3)', [id, name, lastname], (error, results) => {

    if (error) {

      throw error

    }

    response.status(201).send(`User added with ID: ${id}`)

  })

}



const updateUser = (request, response) => {

  const id = parseInt(request.params.id)

  const { name, lastname} = request.body;



  pool.query(

    'UPDATE users SET name = $1, lastname = $2 WHERE id = $3',

    [id, name, lastname],

    (error, results) => {

      if (error) {

        throw error

      }

      response.status(200).send(`User modified with ID: ${id}`)

    }

  )

}



const deleteUser = (request, response) => {

  const id = parseInt(request.params.id)



  pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {

    if (error) {

      throw error

    }

    response.status(200).send(`User deleted with ID: ${id}`)

  })

}



module.exports = {

  getUsers,

  getUserById,

  createUser,

  updateUser,

  deleteUser,

}