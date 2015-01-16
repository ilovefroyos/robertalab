package de.fhg.iais.roberta.ast.syntax.action;

import de.fhg.iais.roberta.ast.syntax.BlocklyBlockProperties;
import de.fhg.iais.roberta.ast.syntax.BlocklyComment;
import de.fhg.iais.roberta.ast.syntax.BlocklyConstants;
import de.fhg.iais.roberta.ast.syntax.Phrase;
import de.fhg.iais.roberta.ast.transformer.AstJaxbTransformerHelper;
import de.fhg.iais.roberta.ast.visitor.AstVisitor;
import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.dbc.Assert;

/**
 * This class represents the <b>robActions_motor_on_for</b> and <b>robActions_motor_on</b> blocks from Blockly into the AST (abstract syntax tree).
 * Object from this class will generate code for setting the motors in pilot mode.<br/>
 * <br>
 * The client must provide the {@link DriveDirection} and {@link MotionParam} (distance the robot should cover and speed). <br>
 * <br>
 * To create an instance from this class use the method {@link #make(DriveDirection, MotionParam)}.<br>
 */
public class DriveAction<V> extends Action<V> {
    private final DriveDirection direction;
    private final MotionParam<V> param;

    private DriveAction(DriveDirection direction, MotionParam<V> param, BlocklyBlockProperties properties, BlocklyComment comment) {
        super(Phrase.Kind.DRIVE_ACTION, properties, comment);
        Assert.isTrue(direction != null && param != null);
        this.direction = direction;
        this.param = param;
        setReadOnly();
    }

    /**
     * Creates instance of {@link DriveAction}. This instance is read only and can not be modified.
     *
     * @param direction {@link DriveDirection} in which the robot will drive; must be <b>not</b> null,
     * @param param {@link MotionParam} that set up the parameters for the movement of the robot (distance the robot should cover and speed), must be <b>not</b>
     *        null,
     * @param properties of the block (see {@link BlocklyBlockProperties}),
     * @param comment added from the user,
     * @return read only object of class {@link DriveAction}
     */
    public static <V> DriveAction<V> make(DriveDirection direction, MotionParam<V> param, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new DriveAction<V>(direction, param, properties, comment);
    }

    /**
     * @return {@link DriveDirection} in which the robot will drive
     */
    public DriveDirection getDirection() {
        return this.direction;
    }

    /**
     * @return {@link MotionParam} for the motor (speed and distance in which the motors are set).
     */
    public MotionParam<V> getParam() {
        return this.param;
    }

    @Override
    public String toString() {
        return "DriveAction [" + this.direction + ", " + this.param + "]";
    }

    @Override
    protected V accept(AstVisitor<V> visitor) {
        return visitor.visitDriveAction(this);
    }

    @Override
    public Block astToBlock() {
        Block jaxbDestination = new Block();
        AstJaxbTransformerHelper.setBasicProperties(this, jaxbDestination);

        AstJaxbTransformerHelper.addField(jaxbDestination, BlocklyConstants.DIRECTION, getDirection().name());
        AstJaxbTransformerHelper.addValue(jaxbDestination, BlocklyConstants.POWER, getParam().getSpeed());

        if ( getParam().getDuration() != null ) {
            AstJaxbTransformerHelper.addValue(jaxbDestination, getParam().getDuration().getType().name(), getParam().getDuration().getValue());
        }
        return jaxbDestination;
    }
}
