import prisma from '../utils/prismaClient.js';

const getAllDiseases = async (request, h) => {
  try {
    const diseases = await prisma.disease.findMany({
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
    console.error('Error fetching diseases:', error.message);
    return h.response({ error: 'Failed to fetch diseases' }).code(500);
  }
};

const getDiseaseById = async (request, h) => {
  const { id } = request.params;

  try {
    const disease = await prisma.disease.findUnique({
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
    const diseases = await prisma.disease.findMany({
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

const updateDisease = async (request, h) => {
  const { id } = request.params;
  const { image, description } = request.payload;
  try {
    const updatedDisease = await prisma.disease.update({
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

export { getAllDiseases, updateDisease, getDiseaseById, getDiseasesBySymptoms };
