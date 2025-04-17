
  const group_validation = (payload) => {
    let errors = {};

    if (!payload?.name?.trim()) {
        errors.name = "Name is required";
    }

    if (!payload.members || payload.members.length < 1) {
        errors.members = "Select at least one member";
    }

    return errors;
};

export default group_validation;
