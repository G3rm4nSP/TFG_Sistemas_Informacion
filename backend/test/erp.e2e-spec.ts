import request from 'supertest';
const BASE = 'http://localhost:3000';

describe('ERP E2E CRUD COMPLETO', () => {
  let clienteId: string;
  let proveedorId: string;
  let localId: string;
  let empleadoId: string;
  let empleadoRrhhId: string;
  let empleadoHorarioId: string;
  let empleadoAusenciaId: string;
  let usuarioId: string;
  let productoId: string;
  let ventaId: string;
  let ventaDetalleProductoId: string;
  let compraId: string;
  let compraDetalleProductoId: string;
  let ubicacionId: string;
  let stockId: string;

  /* =========================
     CLIENTE
  ========================== */
  it('CLIENTE CRUD', async () => {
    try {
      const create = await request(BASE).post('/cliente').send({nombre: 'Cliente Test', correo: `cliente${Date.now()}@test.com`});
      expect(create.status).toBe(201);
      clienteId = create.body.id;
      console.log('CLIENTE CREATE OK');

      const get = await request(BASE).get(`/cliente/${clienteId}`);
      expect(get.status).toBe(200);
      console.log('CLIENTE GET OK');

      const update = await request(BASE).patch(`/cliente/${clienteId}`).send({nombre: 'Cliente Update'});
      expect(update.status).toBe(200);
      console.log('CLIENTE UPDATE OK');

      const remove = await request(BASE).delete(`/cliente/${clienteId}`);
      expect(remove.status).toBe(200);
      console.log('CLIENTE DELETE OK');
    } catch (err) {
      console.log('CLIENTE CRUD ERROR', err);
    }
  });

  /* =========================
     PROVEEDOR
  ========================== */
  it('PROVEEDOR CRUD', async () => {
    try {
      const create = await request(BASE).post('/proveedor').send({nombre: 'Proveedor Test', correo: `prov${Date.now()}@test.com`});
      expect(create.status).toBe(201);
      proveedorId = create.body.id;
      console.log('PROVEEDOR CREATE OK');

      const get = await request(BASE).get(`/proveedor/${proveedorId}`);
      expect(get.status).toBe(200);
      console.log('PROVEEDOR GET OK');

      const update = await request(BASE).patch(`/proveedor/${proveedorId}`).send({nombre: 'Proveedor Update'});
      expect(update.status).toBe(200);
      console.log('PROVEEDOR UPDATE OK');

      const remove = await request(BASE).delete(`/proveedor/${proveedorId}`);
      expect(remove.status).toBe(200);
      console.log('PROVEEDOR DELETE OK');
    } catch (err) {
      console.log('PROVEEDOR CRUD ERROR', err);
    }
  });

  /* =========================
     LOCAL
  ========================== */
  it('LOCAL CRUD', async () => {
    try {
      const create = await request(BASE).post('/local').send({nombre: 'Local Test', nif: `NIF${Date.now()}`, direccion: 'Calle Test'});
      expect(create.status).toBe(201);
      localId = create.body.id;
      console.log('LOCAL CREATE OK');

      const get = await request(BASE).get(`/local/${localId}`);
      expect(get.status).toBe(200);
      console.log('LOCAL GET OK');

      const update = await request(BASE).patch(`/local/${localId}`).send({nombre: 'Local Update'});
      expect(update.status).toBe(200);
      console.log('LOCAL UPDATE OK');

      const remove = await request(BASE).delete(`/local/${localId}`);
      expect(remove.status).toBe(200);
      console.log('LOCAL DELETE OK');
    } catch (err) {
      console.log('LOCAL CRUD ERROR', err);
    }
  });

  /* =========================
     EMPLEADO
  ========================== */
  it('EMPLEADO CRUD', async () => {
    try {
      const create = await request(BASE).post('/empleado').send({
        localId,
        nombre: 'Juan',
        apellidos: 'Pérez',
        correo: `empleado${Date.now()}@test.com`,
        dni: `DNI${Date.now()}`,
        direccion: 'Calle Empleado',
        categoria: 'ventas',
      });
      expect(create.status).toBe(201);
      empleadoId = create.body.id;
      console.log('EMPLEADO CREATE OK');

      const get = await request(BASE).get(`/empleado/${empleadoId}`);
      expect(get.status).toBe(200);
      console.log('EMPLEADO GET OK');

      const update = await request(BASE).patch(`/empleado/${empleadoId}`).send({nombre: 'Juan Update'});
      expect(update.status).toBe(200);
      console.log('EMPLEADO UPDATE OK');

      const remove = await request(BASE).delete(`/empleado/${empleadoId}`);
      expect(remove.status).toBe(200);
      console.log('EMPLEADO DELETE OK');
    } catch (err) {
      console.log('EMPLEADO CRUD ERROR', err);
    }
  });

  /* =========================
     EMPELADO RRHH 1:1
  ========================== */
  it('EMPLEADO_RRHH CRUD', async () => {
    try {
      // Primero creamos empleado
      const empleado = await request(BASE).post('/empleado').send({
        localId,
        nombre: 'RRHH Test',
        apellidos: 'Test',
        correo: `rrhh${Date.now()}@test.com`,
        dni: `DNIRRHH${Date.now()}`,
        direccion: 'Calle RRHH',
        categoria: 'rrhh',
      });
      empleadoId = empleado.body.id;

      const create = await request(BASE).post('/empleado-rrhh').send({
        empleadoId,
        salarioBase: 1200,
        numPagas: 12,
        fechaCobro: new Date(),
        fechaContrato: new Date(),
        irpf: 15,
        numeroSeguridadSocial: '123456789',
        iban: 'ES001234567890',
      });
      expect(create.status).toBe(201);
      empleadoRrhhId = create.body.empleadoId;
      console.log('EMPLEADO_RRHH CREATE OK');

      const get = await request(BASE).get(`/empleado-rrhh/${empleadoRrhhId}`);
      expect(get.status).toBe(200);
      console.log('EMPLEADO_RRHH GET OK');

      const update = await request(BASE).patch(`/empleado-rrhh/${empleadoRrhhId}`).send({salarioBase: 1300});
      expect(update.status).toBe(200);
      console.log('EMPLEADO_RRHH UPDATE OK');

      const remove = await request(BASE).delete(`/empleado-rrhh/${empleadoRrhhId}`);
      expect(remove.status).toBe(200);
      console.log('EMPLEADO_RRHH DELETE OK');

      // Limpiamos empleado RRHH
      await request(BASE).delete(`/empleado/${empleadoId}`);
    } catch (err) {
      console.log('EMPLEADO_RRHH CRUD ERROR', err);
    }
  });
  
  /* =========================
     EMPLEADO_HORARIO 1:N
  ========================== */
  it('EMPLEADO_HORARIO CRUD', async () => {
    try {
      // Crear empleado base
      const empleado = await request(BASE).post('/empleado').send({
        localId,
        nombre: 'Empleado Horario',
        apellidos: 'Test',
        correo: `horario${Date.now()}@test.com`,
        dni: `DNIHORARIO${Date.now()}`,
        direccion: 'Calle Horario',
        categoria: 'ventas',
      });
      empleadoId = empleado.body.id;

      // CREATE
      const create = await request(BASE).post('/empleado-horario').send({
        empleadoId,
        diaSemana: 1,
        horaInicio: '09:00',
        horaFin: '17:00',
      });
      expect(create.status).toBe(201);
      empleadoHorarioId = create.body.id;
      console.log('EMPLEADO_HORARIO CREATE OK');

      // GET
      const get = await request(BASE).get(`/empleado-horario/${empleadoHorarioId}`);
      expect(get.status).toBe(200);
      console.log('EMPLEADO_HORARIO GET OK');

      // UPDATE
      const update = await request(BASE).patch(`/empleado-horario/${empleadoHorarioId}`).send({horaFin: '18:00'});
      expect(update.status).toBe(200);
      console.log('EMPLEADO_HORARIO UPDATE OK');

      // DELETE
      const remove = await request(BASE).delete(`/empleado-horario/${empleadoHorarioId}`);
      expect(remove.status).toBe(200);
      console.log('EMPLEADO_HORARIO DELETE OK');

      // Limpiar empleado
      await request(BASE).delete(`/empleado/${empleadoId}`);
    } catch (err) {
      console.log('EMPLEADO_HORARIO CRUD ERROR', err);
    }
  });

  /* =========================
     EMPLEADO_AUSENCIA 1:N
  ========================== */
  it('EMPLEADO_AUSENCIA CRUD', async () => {
    try {
      // Crear empleado base
      const empleado = await request(BASE).post('/empleado').send({
        localId,
        nombre: 'Empleado Ausencia',
        apellidos: 'Test',
        correo: `ausencia${Date.now()}@test.com`,
        dni: `DNIAUS${Date.now()}`,
        direccion: 'Calle Ausencia',
        categoria: 'ventas',
      });
      empleadoId = empleado.body.id;

      // CREATE
      const create = await request(BASE).post('/empleado-ausencia').send({
        empleadoId,
        tipo: 'vacaciones',
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 días después
        observaciones: 'Test de ausencia',
      });
      expect(create.status).toBe(201);
      empleadoAusenciaId = create.body.id;
      console.log('EMPLEADO_AUSENCIA CREATE OK');

      // GET
      const get = await request(BASE).get(`/empleado-ausencia/${empleadoAusenciaId}`);
      expect(get.status).toBe(200);
      console.log('EMPLEADO_AUSENCIA GET OK');

      // UPDATE
      const update = await request(BASE).patch(`/empleado-ausencia/${empleadoAusenciaId}`).send({observaciones: 'Actualizado'});
      expect(update.status).toBe(200);
      console.log('EMPLEADO_AUSENCIA UPDATE OK');

      // DELETE
      const remove = await request(BASE).delete(`/empleado-ausencia/${empleadoAusenciaId}`);
      expect(remove.status).toBe(200);
      console.log('EMPLEADO_AUSENCIA DELETE OK');

      // Limpiar empleado
      await request(BASE).delete(`/empleado/${empleadoId}`);
    } catch (err) {
      console.log('EMPLEADO_AUSENCIA CRUD ERROR', err);
    }
  });

  /* =========================
     USUARIO
  ========================== */
  it('USUARIO CRUD', async () => {
    try {
      // Creamos empleado para el usuario
      const empleado = await request(BASE).post('/empleado').send({
        localId,
        nombre: 'User Test',
        apellidos: 'Test',
        correo: `user${Date.now()}@test.com`,
        dni: `DNIUSER${Date.now()}`,
        direccion: 'Calle User',
        categoria: 'ventas',
      });
      empleadoId = empleado.body.id;

      const create = await request(BASE).post('/usuario').send({
        empleadoId,
        mail: `user${Date.now()}@test.com`,
        passwordHash: 'fakehash',
      });
      expect(create.status).toBe(201);
      usuarioId = create.body.id;
      console.log('USUARIO CREATE OK');

      const get = await request(BASE).get(`/usuario/${usuarioId}`);
      expect(get.status).toBe(200);
      console.log('USUARIO GET OK');

      const update = await request(BASE).patch(`/usuario/${usuarioId}`).send({rol: 'admin'});
      expect(update.status).toBe(200);
      console.log('USUARIO UPDATE OK');

      const remove = await request(BASE).delete(`/usuario/${usuarioId}`);
      expect(remove.status).toBe(200);
      console.log('USUARIO DELETE OK');

      await request(BASE).delete(`/empleado/${empleadoId}`);
    } catch (err) {
      console.log('USUARIO CRUD ERROR', err);
    }
  });

    /* =========================
    PRODUCTO CRUD
  ========================= */
  it('PRODUCTO CRUD', async () => {
    try {
      const create = await request(BASE).post('/producto').send({
        nombre: 'Producto Test',
        descripcion: 'Desc Test',
        tipo: 'general',
        porcentajeIVA: 21,
        precioBase: 10,
      });
      expect(create.status).toBe(201);
      productoId = create.body.id;
      console.log('PRODUCTO CREATE OK');

      const get = await request(BASE).get(`/producto/${productoId}`);
      expect(get.status).toBe(200);
      console.log('PRODUCTO GET OK');

      const update = await request(BASE).patch(`/producto/${productoId}`).send({precioBase: 15});
      expect(update.status).toBe(200);
      console.log('PRODUCTO UPDATE OK');

      const remove = await request(BASE).delete(`/producto/${productoId}`);
      expect(remove.status).toBe(200);
      console.log('PRODUCTO DELETE OK');
    } catch (err) {
      console.log('PRODUCTO CRUD ERROR', err);
    }
  });

  /* =========================
    VENTA CRUD
  ========================= */
  it('VENTA CRUD', async () => {
    try {
      // Primero creamos empleado y cliente
      const empleado = await request(BASE).post('/empleado').send({
        localId,
        nombre: 'Empleado Venta',
        apellidos: 'Test',
        correo: `empleadoVenta${Date.now()}@test.com`,
        dni: `DNIVENTA${Date.now()}`,
        direccion: 'Calle Venta',
        categoria: 'ventas',
      });
      empleadoId = empleado.body.id;

      const cliente = await request(BASE).post('/cliente').send({nombre: 'Cliente Venta'});
      clienteId = cliente.body.id;

      const create = await request(BASE).post('/venta').send({
        empleadoId,
        clienteId,
        total: 100,
      });
      expect(create.status).toBe(201);
      ventaId = create.body.id;
      console.log('VENTA CREATE OK');

      const get = await request(BASE).get(`/venta/${ventaId}`);
      expect(get.status).toBe(200);
      console.log('VENTA GET OK');

      const update = await request(BASE).patch(`/venta/${ventaId}`).send({total: 150});
      expect(update.status).toBe(200);
      console.log('VENTA UPDATE OK');

      const remove = await request(BASE).delete(`/venta/${ventaId}`);
      expect(remove.status).toBe(200);
      console.log('VENTA DELETE OK');

      // Limpiamos empleado y cliente
      await request(BASE).delete(`/empleado/${empleadoId}`);
      await request(BASE).delete(`/cliente/${clienteId}`);
    } catch (err) {
      console.log('VENTA CRUD ERROR', err);
    }
  });

  /* =========================
    VENTA DETALLE CRUD (PK compuesta)
  ========================= */
  it('VENTADETALLE CRUD', async () => {
    try {
      // Necesitamos venta y producto
      const empleado = await request(BASE).post('/empleado').send({
        localId,
        nombre: 'Empleado VentaDetalle',
        apellidos: 'Test',
        correo: `empleadoVD${Date.now()}@test.com`,
        dni: `DNIVD${Date.now()}`,
        direccion: 'Calle VD',
        categoria: 'ventas',
      });
      empleadoId = empleado.body.id;

      const cliente = await request(BASE).post('/cliente').send({nombre: 'Cliente VD'});
      clienteId = cliente.body.id;

      const venta = await request(BASE).post('/venta').send({
        empleadoId,
        clienteId,
        total: 0,
      });
      ventaId = venta.body.id;

      const producto = await request(BASE).post('/producto').send({
        nombre: 'Producto VD',
        descripcion: 'Desc VD',
        tipo: 'general',
        porcentajeIVA: 21,
        precioBase: 20,
      });
      productoId = producto.body.id;

      const create = await request(BASE).post('/venta-detalle').send({
        ventaId,
        productoId,
        cantidad: 2,
        precioSinIVA: 20,
        precioFinal: 24.2,
      });
      expect(create.status).toBe(201);
      console.log('VENTADETALLE CREATE OK');

      const get = await request(BASE).get(`/venta-detalle/${ventaId}/${productoId}`);
      expect(get.status).toBe(200);
      console.log('VENTADETALLE GET OK');

      const update = await request(BASE).patch(`/venta-detalle/${ventaId}/${productoId}`).send({cantidad: 3});
      expect(update.status).toBe(200);
      console.log('VENTADETALLE UPDATE OK');

      const remove = await request(BASE).delete(`/venta-detalle/${ventaId}/${productoId}`);
      expect(remove.status).toBe(200);
      console.log('VENTADETALLE DELETE OK');

      // Limpiamos venta, producto, empleado, cliente
      await request(BASE).delete(`/venta/${ventaId}`);
      await request(BASE).delete(`/producto/${productoId}`);
      await request(BASE).delete(`/empleado/${empleadoId}`);
      await request(BASE).delete(`/cliente/${clienteId}`);
    } catch (err) {
      console.log('VENTADETALLE CRUD ERROR', err);
    }
  });

  /* =========================
    COMPRA CRUD
  ========================= */
  it('COMPRA CRUD', async () => {
    try {
      // Necesitamos proveedor y local
      const proveedor = await request(BASE).post('/proveedor').send({nombre: 'Proveedor Compra'});
      proveedorId = proveedor.body.id;

      const create = await request(BASE).post('/compra').send({
        proveedorId,
        localId,
        total: 200,
      });
      expect(create.status).toBe(201);
      compraId = create.body.id;
      console.log('COMPRA CREATE OK');

      const get = await request(BASE).get(`/compra/${compraId}`);
      expect(get.status).toBe(200);
      console.log('COMPRA GET OK');

      const update = await request(BASE).patch(`/compra/${compraId}`).send({total: 250});
      expect(update.status).toBe(200);
      console.log('COMPRA UPDATE OK');

      const remove = await request(BASE).delete(`/compra/${compraId}`);
      expect(remove.status).toBe(200);
      console.log('COMPRA DELETE OK');

      await request(BASE).delete(`/proveedor/${proveedorId}`);
    } catch (err) {
      console.log('COMPRA CRUD ERROR', err);
    }
  });

  /* =========================
    COMPRA DETALLE CRUD (PK compuesta)
  ========================= */
  it('COMPRADETALLE CRUD', async () => {
    try {
      // Necesitamos compra y producto
      const proveedor = await request(BASE).post('/proveedor').send({nombre: 'Proveedor CD'});
      proveedorId = proveedor.body.id;

      const compra = await request(BASE).post('/compra').send({
        proveedorId,
        localId,
        total: 0,
      });
      compraId = compra.body.id;

      const producto = await request(BASE).post('/producto').send({
        nombre: 'Producto CD',
        descripcion: 'Desc CD',
        tipo: 'general',
        porcentajeIVA: 21,
        precioBase: 30,
      });
      productoId = producto.body.id;

      const create = await request(BASE).post('/compra-detalle').send({
        compraId,
        productoId,
        cantidad: 5,
        precioLote: 40,
      });
      expect(create.status).toBe(201);
      console.log('COMPRADETALLE CREATE OK');

      const get = await request(BASE).get(`/compra-detalle/${compraId}/${productoId}`);
      expect(get.status).toBe(200);
      console.log('COMPRADETALLE GET OK');

      const update = await request(BASE).patch(`/compra-detalle/${compraId}/${productoId}`).send({cantidad: 10});
      expect(update.status).toBe(200);
      console.log('COMPRADETALLE UPDATE OK');

      const remove = await request(BASE).delete(`/compra-detalle/${compraId}/${productoId}`);
      expect(remove.status).toBe(200);
      console.log('COMPRADETALLE DELETE OK');

      await request(BASE).delete(`/compra/${compraId}`);
      await request(BASE).delete(`/producto/${productoId}`);
      await request(BASE).delete(`/proveedor/${proveedorId}`);
    } catch (err) {
      console.log('COMPRADETALLE CRUD ERROR', err);
    }
  });

  /* =========================
    UBICACION CRUD
  ========================= */
  it('UBICACION CRUD', async () => {
    try {
      const create = await request(BASE).post('/ubicacion').send({localId, descripcion: 'Almacén Principal'});
      expect(create.status).toBe(201);
      ubicacionId = create.body.id;
      console.log('UBICACION CREATE OK');

      const get = await request(BASE).get(`/ubicacion/${ubicacionId}`);
      expect(get.status).toBe(200);
      console.log('UBICACION GET OK');

      const update = await request(BASE).patch(`/ubicacion/${ubicacionId}`).send({descripcion: 'Almacén Secundario'});
      expect(update.status).toBe(200);
      console.log('UBICACION UPDATE OK');

      const remove = await request(BASE).delete(`/ubicacion/${ubicacionId}`);
      expect(remove.status).toBe(200);
      console.log('UBICACION DELETE OK');
    } catch (err) {
      console.log('UBICACION CRUD ERROR', err);
    }
  });

  /* =========================
    STOCK CRUD
  ========================= */
  it('STOCK CRUD', async () => {
    try {
      // Necesitamos producto y ubicación
      const producto = await request(BASE).post('/producto').send({
        nombre: 'Producto Stock',
        descripcion: 'Desc Stock',
        tipo: 'general',
        porcentajeIVA: 21,
        precioBase: 50,
      });
      productoId = producto.body.id;

      const ubicacion = await request(BASE).post('/ubicacion').send({localId, descripcion: 'Almacén Stock'});
      ubicacionId = ubicacion.body.id;

      const create = await request(BASE).post('/stock').send({
        productoId,
        ubicacionId,
        cantidad: 100,
      });
      expect(create.status).toBe(201);
      console.log('STOCK CREATE OK');

      const get = await request(BASE).get(`/stock/${create.body.id}`);
      expect(get.status).toBe(200);
      console.log('STOCK GET OK');

      const update = await request(BASE).patch(`/stock/${create.body.id}`).send({cantidad: 150});
      expect(update.status).toBe(200);
      console.log('STOCK UPDATE OK');

      const remove = await request(BASE).delete(`/stock/${create.body.id}`);
      expect(remove.status).toBe(200);
      console.log('STOCK DELETE OK');

      await request(BASE).delete(`/producto/${productoId}`);
      await request(BASE).delete(`/ubicacion/${ubicacionId}`);
    } catch (err) {
      console.log('STOCK CRUD ERROR', err);
    }
  });
});
