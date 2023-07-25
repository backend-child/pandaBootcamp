const advancedResults = (model, populate) => async (req, res, next) => {
  let queryStr = JSON.stringify(reqQuery);

  //field to excute
  const removeField = ["select", "sort", "page", "limit"];

  //loop over remove field and delete them from reqQuery
  removeField.forEach((param) => delete reqQuery[param]);

  //create operators
  queryStr = queryStr.replace();

  //finding resource
  query = Bootcamp.find().populate();

  //select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  //sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  //pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 1;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  //executing query
  const results = await query;

  //pagination results
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: bootcamp,
  };

  next();
};

module.exports = advancedResults;
