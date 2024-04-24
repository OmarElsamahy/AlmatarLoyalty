const paginate = (Model) => {
    /**
     * @typedef {Object} QueryResult
     * @property {Array} results - Results found
     * @property {number} page - Current page
     * @property {number} limit - Maximum number of results per page
     * @property {number} totalPages - Total number of pages
     * @property {number} totalResults - Total number of documents
     */

    /**
     * Query for documents with pagination
     * @param {Object} [filter] - Sequelize filter
     * @param {Object} [options] - Query options
     * @param {string} [options.sortBy] - Sorting criteria using the format: sortField:direction (e.g., 'createdAt:desc')
     * @param {number} [options.limit] - Maximum number of results per page (default = 10)
     * @param {number} [options.page] - Current page (default = 1)
     * @param {Array} [options.include] - Array of Sequelize `include` options for model associations
     * @returns {Promise<QueryResult>}
     */
    const paginateFn = async (filter = {}, options = {}) => {
      const limit = options.limit ? parseInt(options.limit, 10) : 10;
      const page = options.page ? parseInt(options.page, 10) : 1;
      const offset = (page - 1) * limit;

      let order = [['createdAt', 'asc']]; // Default sort
      if (options.sortBy) {
        order = options.sortBy.split(',').map((sortOption) => {
          const [field, direction] = sortOption.split(':');
          return [field, direction === 'desc' ? 'DESC' : 'ASC'];
        });
      }

      const queryOptions = {
        where: filter,
        limit,
        offset,
        order,
        include: options.include || [],
      };

      const { count, rows } = await Model.findAndCountAll(queryOptions);

      const totalPages = Math.ceil(count / limit);

      return {
        results: rows,
        page,
        limit,
        totalPages,
        totalResults: count,
      };
    };

    return paginateFn;
  };

  module.exports = paginate;
