import { Badge, Button, Card, CardBody, CardImg, CardSubtitle, CardText, CardTitle, Row } from 'reactstrap';
import { Link } from 'react-router-dom';

export function TripThumbnail ({ trip, onApply }) {
  return (
    <Card className='grid-item card-size'>
      <Link to={'/trip/' + trip.id}>
        <CardImg
          className='trip-card-image'
          alt='Card image cap'
          src={trip.defaultPicture?.path ?? 'https://picsum.photos/318/180'}
          top
        />
      </Link>
      <CardBody>
        <CardTitle tag='h4'>
          <Link to={'/trip/' + trip.id}>{trip.title}</Link>
        </CardTitle>
        <CardSubtitle
          className='mb-2 text-muted'
          tag='h5'
        >
          <Badge
            color='info mx-3'
            href='#'
          > {trip.ticker}
          </Badge>
          <Badge
            color='info mx-3'
            href='#'
          > {trip.manager.name + ' ' + trip.manager.surname}
          </Badge>
          <Badge
            color='info mx-3'
            href='#'
          > {trip.startDate + ' -  ' + trip.endDate}
          </Badge>
        </CardSubtitle>
        <CardText>
          {trip.description}
        </CardText>
        <Row>
          <h3>${trip.price.toFixed(2)}</h3>
        </Row>
        <Row>
          <Button
            className='btn btn-sm btn-success'
            onClick={() => onApply(trip)}
          >
            <h5><i className='fa fa-cart-plus' aria-hidden='true'> ¡Quiero ir! </i></h5>
          </Button>
        </Row>

      </CardBody>
    </Card>
  );
}
