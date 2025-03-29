import models from '../model/models.js';

const getAllSymptoms = async (request, h) => {
  try {
    const symptoms = await models.Symptom.findMany({
      select: {
        id: true,
        name: true,
        description: true
      }
    });
    return h.response(symptoms).code(200);
  } catch (error) {
    console.error('Error fetching symptoms:', error.message);
    return h.response({ error: 'Failed to fetch symptoms' }).code(500);
  }
};
const getSymptomById = async (request, h) => {
  const { id } = request.params;

  try {
    const symptom = await models.Symptom.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true
      }
    });

    if (!symptom) {
      return h.response({ error: 'Symptom not found' }).code(404);
    }

    return h.response(symptom).code(200);
  } catch (error) {
    console.error('Error fetching symptom by ID:', error.message);
    return h.response({ error: 'Failed to fetch symptom' }).code(500);
  }
};

const getSymptomwithPagination = async (request, h) => {
  const { page = 1, limit = 10 } = request.query;

  try {
    const skip = (page - 1) * limit;
    const symptoms = await models.Symptom.findMany({
      skip,
      take: parseInt(limit),
      select: {
        id: true,
        name: true,
        description: true
      }
    });
    const totalSymptoms = await models.Symptom.count();
    const totalPages = Math.ceil(totalSymptoms / limit);
    const formattedSymptom = symptoms.map((symptom) => ({
      id: symptom.id,
      name: symptom.name,
      description: symptom.description
    }));
    return h
      .response({
        data: formattedSymptom,
        pagination: {
          totealItems: totalSymptoms,
          totalPages,
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit)
        }
      })
      .code(200);
  } catch (error) {
    console.error('Error fetching symptoms with pagination:', error.message);
    return h
      .response({ error: 'Failed to fetch symptoms with pagination' })
      .code(500);
  }
};

const updateSymptom = async (request, h) => {
  const { id } = request.params;
  const { description } = request.payload;
  try {
    const updatedSymptom = await models.Symptom.update({
      where: { id },
      data: { description },
      select: {
        id: true,
        name: true,
        description: true
      }
    });

    return h.response(updatedSymptom).code(200);
  } catch (error) {
    console.error('Error updating symptom:', error.message);

    if (error.code === 'P2025') {
      return h.response({ error: 'Symptom not found' }).code(404);
    }

    return h.response({ error: 'Failed to update symptom' }).code(500);
  }
};

export {
  getAllSymptoms,
  getSymptomById,
  updateSymptom,
  getSymptomwithPagination
};
