const signin_validation = (payload) => {
    let errors = {};

    if (!payload?.email?.trim()) {
        errors.email = "Email is required";
    }

    if (!payload?.password?.trim()) {
        errors.password = "Password is required";
    }

    return errors;
};

export default signin_validation;
