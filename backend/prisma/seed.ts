import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Crear Local
  const local = await prisma.local.create({
    data: {
      nombre: 'Oficina Central',
      nif: 'B12345678',
      direccion: 'Calle Mayor 123',
      correo: 'info@empresa.com',
      telefono: '600123456',
      horarioApertura: '08:00 - 18:00'
    }
  })

  // Creal Ubicaciones de Local (almacen/tienda)
  const almacen = await prisma.ubicacion.create({
    data: {
        localId: local.id,
        tipo: 'ALMACEN',
        descripcion: 'Almacen principal'
    }
  })

  // Creal Ubicaciones de Local (almacen/tienda)
  const tienda = await prisma.ubicacion.create({
    data: {
        localId: local.id,
        tipo: 'TIENDA',
        descripcion: 'Planta 1'
    }
  })
  
  const passwordHash = await bcrypt.hash('admin123', 10)

  // Crear Empleado ADMIN
  const empleadoAdmin = await prisma.empleado.create({
    data: {
      localId: local.id,
      nombre: 'Juan',
      apellidos: 'Luis Sanchez',
      correo: 'JuanLuisSanchez@gmail.com',
      telefono: '631234567',
      dni: '123456789Z',
      direccion: 'C/La calle 20 4ºI',
      categoria: 'Prueba',

      rrhh: {
        create: {
          salarioBase : 25000,
          numPagas : 14,
          comision : 0.20,
          fechaCobro : new Date('2026-02-18T10:30:00.000Z'),
          fechaContrato : new Date('2026-02-18T10:30:00.000Z'),
          irpf : 0.12,
          numeroSeguridadSocial : '1234567890987654321',
          iban : '87654321',
        }
      },
      usuario: {
        create: {
          mail: 'admin@erp.com',
          passwordHash,
          rol: 'ADMIN',
          activo: true,
          intentosFallidos: 0
        }
      }
    },
    include: {
        rrhh : true,
        usuario : true,
    }
  })

    const passwordHash1 = await bcrypt.hash('jefe123', 10)

  // Crear Empleado JEFE
  const empleadoJefe = await prisma.empleado.create({
    data: {
      localId: local.id,
      nombre: 'Pepe',
      apellidos: 'Ruiz',
      correo: 'Pepe Ruiz@gmail.com',
      telefono: '693769285',
      dni: '296749385Z',
      direccion: 'C/La ralla 10 4ºI',
      categoria: 'Jefe',

      rrhh: {
        create: {
          salarioBase : 50000,
          numPagas : 14,
          fechaCobro : new Date('2026-02-18T10:30:00.000Z'),
          fechaContrato : new Date('2026-02-18T10:30:00.000Z'),
          irpf : 0.10,
          numeroSeguridadSocial : '939485768559403211',
          iban : '87940284',
        }
      },
      usuario: {
        create: {
          mail: 'jefe@erp.com',
          passwordHash : passwordHash1,
          rol: 'JEFE',
          activo: true,
          intentosFallidos: 0
        }
      }
    },
    include: {
        rrhh : true,
        usuario : true,
    }
  })


    const passwordHash2 = await bcrypt.hash('rrhh123', 10)

  // Crear Empleado RRHH
  const empleadoRRHH = await prisma.empleado.create({
    data: {
      localId: local.id,
      nombre: 'Sofia',
      apellidos: 'Chamberi',
      correo: 'sofiachamberi@gmail.com',
      telefono: '653479765',
      dni: '158483934Z',
      direccion: 'C/La otra 21 4ºI',
      categoria: 'Rrhh',

      rrhh: {
        create: {
          salarioBase : 30000,
          numPagas : 14,
          fechaCobro : new Date('2026-02-18T10:30:00.000Z'),
          fechaContrato : new Date('2026-02-18T10:30:00.000Z'),
          irpf : 0.22,
          numeroSeguridadSocial : '0192856639098767796424',
          iban : '867482957',
        }
      },
      usuario: {
        create: {
          mail: 'rrhh@erp.com',
          passwordHash : passwordHash2,
          rol: 'RRHH',
          activo: true,
          intentosFallidos: 0
        }
      }
    },
    include: {
        rrhh : true,
        usuario : true,
    }
  })


    const passwordHash3 = await bcrypt.hash('venta123', 10)

  // Crear Empleado ADMIN
  const empleado = await prisma.empleado.create({
    data: {
      localId: local.id,
      nombre: 'German',
      apellidos: 'Sanchez Portillo',
      correo: 'GermanSanchez@gmail.com',
      telefono: '974624174',
      dni: '14434567V',
      direccion: 'C/La una mas 4ºI',
      categoria: 'Vendedor',

      rrhh: {
        create: {
          salarioBase : 22000,
          numPagas : 14,
          comision : 0.20,
          fechaCobro : new Date('2026-02-18T10:30:00.000Z'),
          fechaContrato : new Date('2026-02-18T10:30:00.000Z'),
          irpf : 0.30,
          numeroSeguridadSocial : '195673918573956106',
          iban : '947682018',
        }
      },
      usuario: {
        create: {
          mail: 'venta@erp.com',
          passwordHash : passwordHash3,
          rol: 'VENTAS',
          activo: true,
          intentosFallidos: 0
        }
      }
    },
    include: {
        rrhh : true,
        usuario : true,
    }
  })




  console.log('✅ Seed completado')
}



main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })