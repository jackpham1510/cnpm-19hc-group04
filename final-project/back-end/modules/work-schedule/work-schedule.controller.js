const log4js = require('log4js');
const logger = log4js.getLogger('Controllers');
const Joi = require('@hapi/joi');
const responseUtil = require('../../utils/response.util');
const HttpStatus = require("http-status-codes");
const { WORK_SCHEDULE_MESSAGE, CONTROLLER_NAME } = require('./work-schedule.constant');
const { AddWorkScheduleValidationSchema } = require('./validations/add-work-schedule.schema');
const WorkScheduleModel = require('./work-schedule.model');
const WorkShiftModel = require('../work-shift/work-shift.model');
const WorkAssignmentModel = require('../work-assignment/work-assignment.model');

const addWorkSchedule = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::addWorkSchedule::was called`);
  try {
    const { error } = Joi.validate(req.body, AddWorkScheduleValidationSchema);
    if (error) {
      return responseUtil.joiValidationResponse(error, res);
    }

    const newWorkScheduleInfo = req.body;
    const isValidMonth = newWorkScheduleInfo.month >= 1 && newWorkScheduleInfo.month <= 12;
    if (!isValidMonth) {
      logger.info(`${CONTROLLER_NAME}::addWorkSchedule::invalid month`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [WORK_SCHEDULE_MESSAGE.ERROR.INVALID_WORK_MONTH]
      });
    }

    const isValidYear = newWorkScheduleInfo.year >= 2020;
    if (!isValidYear) {
      logger.info(`${CONTROLLER_NAME}::addWorkSchedule::invalid year`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [WORK_SCHEDULE_MESSAGE.ERROR.INVALID_WORK_YEAR]
      });
    }

    const duplicatedSchedule = await WorkScheduleModel.findOne({
      month: newWorkScheduleInfo.month,
      year: newWorkScheduleInfo.year
    });
    if (duplicatedSchedule) {
      logger.info(`${CONTROLLER_NAME}::addWorkSchedule::duplicated schedule`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [WORK_SCHEDULE_MESSAGE.ERROR.DUPLICATED_WORK_SCHEDULE]
      });
    }

    const newWorkSchedule = new WorkScheduleModel(newWorkScheduleInfo);
    await newWorkSchedule.save();

    logger.info(`${CONTROLLER_NAME}::addWorkSchedule::a work schedule was added`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { workSchedule: newWorkSchedule },
      messages: [WORK_SCHEDULE_MESSAGE.SUCCESS.ADD_WORK_SCHEDULE_SUCCESS]
    })
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::addWorkSchedule::error`);
    return next(error);
  }
}

const getWorkSchedules = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::getWorkSchedules::was called`);
  try {
    let workSchedules = await WorkScheduleModel.find({}).populate('workShifts', '-workSchedule');
    workSchedules = await Promise.all(
      workSchedules.map(async (workSchedule) => {
        const _workSchedule = JSON.parse(JSON.stringify(workSchedule));

        let workShifts = await WorkShiftModel.find({ workSchedule: _workSchedule._id })
          .populate('workAssignments', '-workShift');

        workShifts = await Promise.all(
          workShifts.map(async (ws) => {
            const _ws = JSON.parse(JSON.stringify(ws));
            let workAssignments = await WorkAssignmentModel.find({ workShift: _ws._id })
              .populate('assigner', '_id fullname avatar role');
              
            workAssignments = JSON.parse(JSON.stringify(workAssignments));
            for(let wa of workAssignments)
              delete wa.workShift;

            _ws.workAssignments = workAssignments;
            return _ws;
          })
        );

        _workSchedule.workShifts = workShifts;
        return _workSchedule;
      })
    );

    logger.info(`${CONTROLLER_NAME}::getWorkSchedules::was called`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { workSchedules },
      messages: [WORK_SCHEDULE_MESSAGE.SUCCESS.GET_WORK_SCHEDULES_SUCCESS]
    })
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::getWorkSchedules::error`);
    return next(error);
  }
}

module.exports = {
  addWorkSchedule,
  getWorkSchedules
}