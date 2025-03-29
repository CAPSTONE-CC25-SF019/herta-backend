import models from '../model/models.js';

const getAllDiseases = async (request, h) => {
  try {
    const diseases = await models.Disease.findMany({
      include: {
        symptoms: {
          select: {
            symptom: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });

    const formattedDiseases = diseases.map((disease) => ({
      id: disease.id,
      name: disease.name,
      image: disease.image,
      description: disease.description,
      symptoms: disease.symptoms.map((s) => s.symptom)
    }));

    return h.response(formattedDiseases).code(200);
  } catch (error) {
    console.error('Error fetching all diseases:', error.message);
    return h.response({ error: 'Failed to fetch diseases' }).code(500);
  }
};

const getDiseaseById = async (request, h) => {
  const { id } = request.params;

  try {
    const disease = await models.disease.findUnique({
      where: { id },
      include: {
        symptoms: {
          select: {
            symptom: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });

    if (!disease) {
      return h.response({ error: 'Disease not found' }).code(404);
    }

    const formattedDisease = {
      ...disease,
      symptoms: disease.symptoms.map((s) => s.symptom)
    };

    return h.response(formattedDisease).code(200);
  } catch (error) {
    console.error('Error fetching disease by ID:', error.message);
    return h.response({ error: 'Failed to fetch disease' }).code(500);
  }
};

const getDiseasesBySymptoms = async (request, h) => {
  const { symptomIds } = request.query;

  try {
    const ids = symptomIds.split(',');
    const diseases = await models.disease.findMany({
      where: {
        symptoms: {
          some: {
            symptomId: {
              in: ids
            }
          }
        }
      },
      include: {
        symptoms: {
          select: {
            symptom: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });

    const formattedDiseases = diseases.map((disease) => ({
      ...disease,
      symptoms: disease.symptoms.map((s) => s.symptom)
    }));

    return h.response(formattedDiseases).code(200);
  } catch (error) {
    console.error('Error fetching diseases by symptoms:', error.message);
    return h
      .response({ error: 'Failed to fetch diseases by symptoms' })
      .code(500);
  }
};

const getDiseasesWithPagination = async (request, h) => {
  const { page = 1, limit = 10 } = request.query;

  try {
    const skip = (page - 1) * limit;
    const diseases = await models.Disease.findMany({
      skip,
      take: parseInt(limit),
      include: {
        symptoms: {
          select: {
            symptom: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });

    const totalDiseases = await models.Disease.count();
    const totalPages = Math.ceil(totalDiseases / limit);
    const formattedDiseases = diseases.map((disease) => ({
      id: disease.id,
      name: disease.name,
      image: disease.image,
      description: disease.description,
      symptoms: disease.symptoms.map((s) => s.symptom)
    }));

    return h
      .response({
        data: formattedDiseases,
        pagination: {
          totalItems: totalDiseases,
          totalPages,
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit)
        }
      })
      .code(200);
  } catch (error) {
    console.error('Error fetching diseases with pagination:', error.message);
    return h
      .response({ error: 'Failed to fetch diseases with pagination' })
      .code(500);
  }
};

const updateDisease = async (request, h) => {
  const { id } = request.params;
  const { image, description } = request.payload;
  try {
    const updatedDisease = await models.disease.update({
      where: { id },
      data: { image, description }
    });

    return h.response(updatedDisease).code(200);
  } catch (error) {
    console.error('Error updating disease:', error.message);
    if (error.code === 'P2025') {
      return h.response({ error: 'Disease not found' }).code(404);
    }
    return h.response({ error: 'Failed to update disease' }).code(500);
  }
};

export {
  getAllDiseases,
  updateDisease,
  getDiseaseById,
  getDiseasesBySymptoms,
  getDiseasesWithPagination
};
