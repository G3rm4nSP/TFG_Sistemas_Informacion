import { Prisma } from '@prisma/client';

export const empleadoSelect = {
  id: true,
  nombre: true,
  apellidos: true,
  correo: true,
  telefono: true,
  dni: true,
  direccion: true,
  activo: true,
  categoria: true,
  localId: true,
  rrhh: {
    select:{
      empleadoId : true,
      salarioBase : true,
      numPagas : true,
      comision : true,
      fechaCobro : true,
      fechaContrato : true,
      irpf : true,
      numeroSeguridadSocial: true,
      iban : true,
    }
  },
  local: {
    select: {
      id: true,
      nombre: true,
    }
  },

} satisfies Prisma.EmpleadoSelect;