module.exports = {

    user:(app, req, res) => {

        req.assert('_name', 'O nome é obrigatorio').notEmpty();
        req.assert('_email', 'O email é invalido').notEmpty().isEmail();

        let errors = req.validationErrors();

        if (errors) {

            app.utils.error.send(errors, req, res);
            return false;

        } else {

            return true;
        }
    }

};