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

  // Crear Empleado
  const empleado = await prisma.empleado.create({
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
          fechaCobro : '2026-02-18T10:30:00.000Z',
          fechaContrato : '2026-02-18T10:30:00.000Z',
          irpf : 0.12,
          numeroSeguridadSocial : '1234567890987654321',
          iban : '87654321',
        }
      }
    },
    include: {
        rrhh : true,
    }
  })

  // Crear Usuario ADMIN
  const passwordHash = await bcrypt.hash('admin123', 10)

  await prisma.usuario.create({
    data: {
      empleadoId: empleado.id,
      mail: 'admin@erp.com',
      passwordHash,
      rol: 'ADMIN',
      activo: true,
      intentosFallidos: 0
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