export const errorHandlerMiddleware = (err, req, res, next) => {
    console.error(err) // Log del error para debugging

    const status = err.status || 500
    const message = err.message || 'Error interno del servidor'

    return res.status(status).json({
        ok: false,
        status: status,
        message: message,
        data: null
    })
}