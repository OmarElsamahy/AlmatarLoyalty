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

const paginate = (Model) => {
  Model.paginate = async ({
    page_number = 1,
    page_size = 10,
    where = {},
    order = []
  }) => {
    const offset = (page_number - 1) * page_size;
    const limit = page_size;

    const { count, rows } = await Model.findAndCountAll({
      where,
      order,
      limit,
      offset,
    });

    return {
      total_items: count,
      total_pages: Math.ceil(count / page_size),
      current_page: page_number,
      page_size,
      data: rows,
    };
  };
};

module.exports = paginate;
