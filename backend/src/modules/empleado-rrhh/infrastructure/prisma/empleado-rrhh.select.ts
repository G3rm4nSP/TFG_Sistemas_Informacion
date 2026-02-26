import { Prisma } from "@prisma/client";

export const empleadoRRHHSelect = {
    empleadoId : true,
    salarioBase : true,
    numPagas : true,
    comision : true,
    fechaCobro : true,
    fechaContrato : true,
    irpf : true,
    numeroSeguridadSocial: true,
    iban : true,
} satisfies Prisma.EmpleadoRRHHSelect;